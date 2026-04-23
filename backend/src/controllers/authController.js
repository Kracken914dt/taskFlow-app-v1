const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Inicializar cliente SNS
const snsClient = process.env.AWS_REGION 
  ? new SNSClient({ region: process.env.AWS_REGION })
  : null;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Envía notificación a SNS cuando se registra un usuario
const publishUserRegistrationEvent = async (user) => {
  if (!snsClient || !process.env.SNS_TOPIC_ARN) {
    console.log('SNS no configurado, omitiendo notificación de registro');
    return;
  }

  try {
    const message = {
      subject: 'Nuevo Usuario Registrado',
      email: user.email,
      name: user.name,
      role: user.role,
      timestamp: new Date().toISOString(),
    };

    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: 'Nuevo Usuario Registrado en TaskFlow',
      Message: JSON.stringify(message, null, 2),
      MessageAttributes: {
        email: {
          DataType: 'String',
          StringValue: user.email,
        },
        userId: {
          DataType: 'String',
          StringValue: user._id.toString(),
        },
      },
    };

    const command = new PublishCommand(params);
    await snsClient.send(command);
    console.log(`Evento de registro publicado para ${user.email}`);
  } catch (error) {
    console.error('Error publicando a SNS:', error);
    // No lanzar error, ya que la notificación es secundaria
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    const user = await User.create({ name, email, password, role });
    
    // Publica el evento de registro a SNS
    await publishUserRegistrationEvent(user);
    
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Cuenta desactivada.' });
    }

    const token = generateToken(user._id);
    const userResponse = user.toJSON();

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, role },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, getUsers };

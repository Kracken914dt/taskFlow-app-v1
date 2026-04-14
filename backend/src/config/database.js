const mongoose = require('mongoose');

/**
 * PATRÓN SINGLETON — Conexión a MongoDB
 *
 * Problema: Si cada módulo creara su propia conexión a MongoDB,
 * tendríamos múltiples conexiones abiertas desperdiciando recursos.
 *
 * Solución: Garantizar que exista una sola instancia de la conexión
 * durante todo el ciclo de vida de la aplicación.
 */
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection._instance) {
      throw new Error(
        '[Singleton] Ya existe una instancia de DatabaseConnection. Usa DatabaseConnection.getInstance()'
      );
    }
    this._connection = null;
    this._isConnected = false;
    console.log('🔧 [Singleton] Nueva instancia de DatabaseConnection creada');
  }

  /**
   * Punto de acceso global a la instancia única.
   * Si no existe, la crea. Si ya existe, la reutiliza.
   */
  static getInstance() {
    if (!DatabaseConnection._instance) {
      DatabaseConnection._instance = new DatabaseConnection();
    } else {
      console.log('♻️  [Singleton] Reutilizando instancia existente de DatabaseConnection');
    }
    return DatabaseConnection._instance;
  }

  async connect(uri) {
    if (this._isConnected) {
      console.log('♻️  [Singleton] Conexión MongoDB ya activa, reutilizando...');
      return this._connection;
    }

    try {
      this._connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      this._isConnected = true;
      console.log(`✅ [Singleton] MongoDB conectado: ${mongoose.connection.host}`);
      return this._connection;
    } catch (error) {
      console.error('❌ [Singleton] Error al conectar con MongoDB:', error.message);
      throw error;
    }
  }

  getConnection() {
    if (!this._isConnected) {
      throw new Error('[Singleton] No hay conexión activa. Llama a connect() primero.');
    }
    return this._connection;
  }

  isConnected() {
    return this._isConnected;
  }

  async disconnect() {
    if (this._isConnected) {
      await mongoose.disconnect();
      this._isConnected = false;
      DatabaseConnection._instance = null;
      console.log('🔌 [Singleton] Conexión MongoDB cerrada');
    }
  }
}

// Inicializar la propiedad estática
DatabaseConnection._instance = null;

module.exports = DatabaseConnection;

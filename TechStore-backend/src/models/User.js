import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { 
      type: String, 
      enum: ['Administrador del Sistema', 'Gerente de Tienda', 'Empleado de Ventas', 'Auditor', 'user'], 
      default: 'Empleado de Ventas' 
    },
    store: { type: String, default: 'Tienda Central' },
    googleId: { type: String },
    githubId: { type: String },
    avatar: { type: String },
    
    // Control de intentos fallidos
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Configuración MFA
    mfaCode: { type: String },
    mfaExpires: { type: Date },
    mfaAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Propiedad virtual para verificar bloqueo
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hook pre-save corregido para funciones async (sin llamar a next())
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
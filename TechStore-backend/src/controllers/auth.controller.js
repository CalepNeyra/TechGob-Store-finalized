import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;

// REGISTRO DE USUARIOS
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, store } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&)',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const user = await User.create({ name, email, password, role, store });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, store: user.store },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN LOCAL CON CONTROL DE 5 INTENTOS FALLIDOS
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 1. Validar si la cuenta está en periodo de bloqueo
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        message: `Cuenta bloqueada por seguridad. Intente nuevamente en ${minutesLeft} minutos.`,
      });
    }

    // 2. Validar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Bloqueo por 15 minutos
      }
      await user.save();
      return res.status(401).json({
        message: `Credenciales inválidas. Intentos restantes: ${Math.max(0, 5 - user.loginAttempts)}`,
      });
    }

    // Restablecer contadores tras éxito
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // 3. Generar y almacenar Código MFA (Válido por 5 minutos)
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = mfaCode;
    user.mfaExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.mfaAttempts = 0;
    await user.save();

    console.log(`\n==========================================`);
    console.log(`CÓDIGO MFA GENERADO PARA [${user.email}]: ${mfaCode}`);
    console.log(`==========================================\n`);

    res.json({
      message: 'Credenciales correctas. Ingrese el código MFA.',
      mfaRequired: true,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// VERIFICACIÓN DE CÓDIGO MFA
export const verifyMFA = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.mfaCode) {
      return res.status(400).json({ message: 'Solicitud MFA inválida o no encontrada' });
    }

    if (user.mfaExpires < new Date()) {
      return res.status(400).json({ message: 'El código MFA ha expirado. Inicie sesión nuevamente.' });
    }

    // Límite de 3 intentos alcanzado
    if (user.mfaAttempts >= 3) {
      user.mfaCode = undefined;
      user.mfaExpires = undefined;
      await user.save();
      return res.status(429).json({ message: 'Superó el límite de 3 intentos para el código MFA. Inicie sesión de nuevo.' });
    }

    if (user.mfaCode !== code) {
      user.mfaAttempts += 1;
      
      if (user.mfaAttempts >= 3) {
        user.mfaCode = undefined;
        user.mfaExpires = undefined;
        await user.save();
        return res.status(429).json({ message: 'Código incorrecto. Superó los 3 intentos máximos. Solicite un nuevo código.' });
      }

      await user.save();
      return res.status(401).json({
        message: `Código MFA incorrecto. Intentos restantes: ${3 - user.mfaAttempts}`,
      });
    }

    // Limpieza de tokens MFA e inicio exitoso
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    user.mfaAttempts = 0;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Autenticación MFA exitosa. Acceso concedido.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, store: user.store },
    });
  } catch (error) {
    next(error);
  }
};

// CALLBACK OAUTH
export const socialCallback = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Error al autenticar usuario social' });
  }

  const token = generateToken(req.user._id, req.user.role);
  return res.json({
    message: 'Autenticación social exitosa',
    token,
    user: req.user,
  });
};
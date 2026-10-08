import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String },
    store: { type: String, default: 'Tienda Central' }, // Vinculación a tienda para perfiles de Gerente/Empleado
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
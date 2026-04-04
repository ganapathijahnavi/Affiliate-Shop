import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleClick = () => {
    window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      
      <div className="p-6 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-black leading-tight">
            {product.title}
          </h3>
          <ExternalLink size={20} className="text-red-500 flex-shrink-0 mt-1" />
        </div>
        
        <span className="text-xs font-black uppercase tracking-widest text-red-500 mt-2">
          VIEW PRODUCT
        </span>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { X, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', fullWidth?: boolean }> = ({
  className = "", variant = 'primary', fullWidth, children, ...props
}) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-colors duration-200 flex items-center justify-center gap-2 select-none";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400",
    secondary: "bg-shop-gray text-black hover:bg-gray-300",
    outline: "border border-gray-300 text-black hover:bg-gray-50",
    ghost: "text-gray-500 hover:text-black hover:bg-gray-100"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'red' | 'gray' }> = ({ children, variant = 'gray' }) => {
  const colors = variant === 'red' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-bold ${colors}`}>
      {children}
    </span>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold font-display uppercase">{title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
            {footer && (
              <div className="p-6 bg-gray-50 rounded-b-2xl border-t">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = "", ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black bg-shop-gray transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Alert: React.FC<{ type: 'error' | 'warning', title: string, message: string }> = ({ type, title, message }) => {
  const colors = type === 'error' ? "bg-red-50 border-red-200 text-red-800" : "bg-yellow-50 border-yellow-200 text-yellow-800";
  const iconColor = type === 'error' ? "text-red-500" : "text-yellow-500";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={`p-4 rounded-xl border flex gap-3 ${colors} mb-4 overflow-hidden`}
    >
      <AlertCircle className={`shrink-0 ${iconColor}`} />
      <div>
        <h4 className="font-bold text-sm">{title}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </motion.div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, className = "" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-full transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 ${isOpen ? 'ring-2 ring-black/5 border-black/10' : ''}`}
      >
        <span className="font-medium text-sm text-gray-900 truncate pr-2">
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50
                  ${option.value === value ? 'text-black font-medium bg-gray-50' : 'text-gray-600'}
                `}
              >
                <span>{option.label}</span>
                {option.value === value && <Check size={14} className="text-black" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
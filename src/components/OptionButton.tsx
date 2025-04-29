
import React from 'react';
import { Button } from '@/components/ui/button';

interface OptionButtonProps {
  text: string;
  onClick: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ text, onClick }) => {
  return (
    <Button 
      className="mb-2 text-foreground bg-secondary hover:bg-secondary/80"
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default OptionButton;

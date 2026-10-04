import React, { InputHTMLAttributes, useId } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function InputField({ label, ...props }: InputFieldProps) {
  const id = useId();

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input 
        id={id} 
        className={styles.input} 
        {...props} 
      />
    </div>
  );
}
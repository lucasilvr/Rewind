import React from 'react';
import Link from 'next/link';
import { InputField } from '../../../components/InputField/InputField';
import styles from './page.module.css';

const LoginPage = () => {
  return (
    <div>
      <h1 className={styles.title}>
        Que bom ter você de volta!
      </h1>
      <h2 className={styles.subtitle}>
        Acesse sua conta e continue sua jornada<br/>musical!
      </h2>
      <form className={styles.form}>
        <InputField 
          label="Email" 
          type="email" 
          placeholder="seu@email.com" 
        />
        <InputField 
          label="Senha" 
          type="password" 
          placeholder="..........." 
        />
        <div className={styles.checkboxContainer}>
          <input type="checkbox" id="manter-conectado" className={styles.checkbox} />
          <label htmlFor="manter-conectado" className={styles.checkboxLabel}>
            Manter conectado
          </label>
        </div>
        <button type="submit" className={styles.submitButton}>
          Entrar
        </button>
      </form>
      <div className={styles.footer}>
        <span className={styles.footerText}>Ainda não tem conta? </span>
        <Link href="/cadastro" className={styles.footerLink}>
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
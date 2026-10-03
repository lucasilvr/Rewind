import React from 'react';
import Link from 'next/link';
import { InputField } from '../../../components/InputField/InputField';
import styles from './page.module.css'; 

const CadastroPage = () => {
  return (
    <div>
      <h1 className={styles.title}>
        Crie sua conta!
      </h1>
      <h2 className={styles.subtitle}>
        Sua jornada musical começa aqui.<br />
        Cadastre-se em menos de um minuto.
      </h2>
      
      <form className={styles.form}>
        <InputField 
          label="Nome" 
          type="text" 
          placeholder="Digite seu nome de usuário" 
        />
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
        <InputField 
          label="Confirme sua senha" 
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
          Criar meu perfil
        </button>
      </form>
      <div className={styles.footer}>
        <span className={styles.footerText}>Já tem uma conta? </span>
        <Link href="/login" className={styles.footerLink}>
          Fazer login
        </Link>
      </div>
    </div>
  );
}

export default CadastroPage;
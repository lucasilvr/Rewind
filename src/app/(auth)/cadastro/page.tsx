"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputField } from "../../../components/InputField/InputField";
import styles from "./page.module.css";

const CadastroPage = () => {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirmaSenha) {
      setErro("As senhas não coincidem. Tente novamente.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    //aq eh apenas uma simulaçao, qnd o back tiver pronto eu vou fazer um fetch aqui com post enviando as infos.
    console.log("Enviando para a API:", { nome, email, senha });
    setSucesso(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div>
      <h1 className={styles.title}>Crie sua conta!</h1>
      <h2 className={styles.subtitle}>
        Sua jornada musical começa aqui.
        <br />
        Cadastre-se em menos de um minuto.
      </h2>
      <form className={styles.form} onSubmit={handleCadastro}>
        <InputField
          label="Nome"
          type="text"
          placeholder="Digite seu nome de usuário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <InputField
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          label="Senha"
          type="password"
          placeholder="..........."
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <InputField
          label="Confirme sua senha"
          type="password"
          placeholder="..........."
          value={confirmaSenha}
          onChange={(e) => setConfirmaSenha(e.target.value)}
          required
        />
        {erro && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "16px" }}>
            {erro}
          </p>
        )}
        {sucesso && (
          <p style={{ color: "green", fontSize: "14px", marginBottom: "16px" }}>
            Conta criada com sucesso!
          </p>
        )}
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="manter-conectado"
            className={styles.checkbox}
          />
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
};

export default CadastroPage;

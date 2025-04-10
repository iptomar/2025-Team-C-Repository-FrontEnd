import api from './api';

// Função para fazer login (API)
export const loginUser = async (email, password) => {
    try {
      // Verifica se o email e a password estão preenchidos
      const queryParams = new URLSearchParams({ email, password });
  
      // Faz a chamada à API para autenticação
      const response = await fetch(`https://localhost:7083/api/ApiUtilizadores/loginUser?${queryParams}`, { // Não esquecer de mudar para o endereço correto da API
        method: 'POST'
      });
  
      // Verifica se a resposta da API é bem-sucedida
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Erro ao fazer login');
      }
  
      // Armazena o token no localStorage
      const token = await response.text(); 
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      console.error('Erro no login:', error.message);
      throw error;
    }
  };
  

const API_BASE = "http://localhost:1880";

// Funções de comunicação com Node-RED
export async function getUsers() {
  try {
    const response = await fetch(`${API_BASE}/get-users`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

export async function saveUsers(users) {
  // Para cadastro - usar endpoint direto no register
}

export async function saveCompra(compra) {
  try {
    const response = await fetch(`${API_BASE}/finalizar-compra`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compra)
    });
    return await response.json();
  } catch (error) {
    console.error("Erro ao salvar compra:", error);
    return { error: "Erro de conexão" };
  }
}

export async function getProdutos() {
  try {
    const response = await fetch(`${API_BASE}/get-produtos`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function getRelatorios() {
  try {
    const response = await fetch(`${API_BASE}/get-relatorios`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    return [];
  }
}
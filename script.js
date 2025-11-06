document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("tabela").querySelector("tbody");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnExportar = document.getElementById("btnExportar");
  const btnImportar = document.getElementById("btnImportar");
  const inputCSV = document.getElementById("inputCSV");

  // ✅ Adicionar novo cliente à tabela e enviar pro backend
  btnAdicionar.addEventListener("click", async () => {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const produto = document.getElementById("produto").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const dataInicial = document.getElementById("dataInicial").value;
    const dataFinal = document.getElementById("dataFinal").value;

    if (!nome || !email || !produto || !estado || !dataInicial || !dataFinal) {
      alert("Preencha todos os campos!");
      return;
    }

    const novaLinha = document.createElement("tr");
    const id = tabela.rows.length + 1;

    novaLinha.innerHTML = `
      <td>${id}</td>
      <td>${nome}</td>
      <td>${email}</td>
      <td>${produto}</td>
      <td>${estado}</td>
      <td>${dataInicial}</td>
      <td>${dataFinal}</td>
    `;
    tabela.appendChild(novaLinha);

    // 📨 Enviar JSON para o backend
    try {
      const resposta = await fetch("http://127.0.0.1:1880/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome,
          email,
          produto,
          estado_pagamento: estado,
          data_inicial: dataInicial,
          data_final: dataFinal
        })
      });

      const data = await resposta.json();
      console.log("Resposta do backend:", data);
    } catch (erro) {
      console.error("Erro ao enviar pro servidor:", erro);
    }
  });

  // 💾 Exportar planilha para CSV
  btnExportar.addEventListener("click", () => {
    let csv = "";
    const linhas = document.querySelectorAll("#tabela tr");
    linhas.forEach(linha => {
      const colunas = linha.querySelectorAll("th, td");
      const dados = Array.from(colunas).map(td => `"${td.textContent}"`);
      csv += dados.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clientes.csv";
    link.click();
  });

  // 📂 Importar CSV e atualizar tabela
  btnImportar.addEventListener("click", () => {
    const arquivo = inputCSV.files[0];
    if (!arquivo) {
      alert("Escolha um arquivo CSV primeiro!");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = (e) => {
      const conteudo = e.target.result;
      const linhas = conteudo.split("\n").filter(l => l.trim() !== "");
      tabela.innerHTML = ""; // limpa tabela atual

      linhas.slice(1).forEach((linha, index) => {
        const colunas = linha.split(",").map(c => c.replace(/"/g, ""));
        if (colunas.length >= 7) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${colunas[1]}</td>
            <td>${colunas[2]}</td>
            <td>${colunas[3]}</td>
            <td>${colunas[4]}</td>
            <td>${colunas[5]}</td>
            <td>${colunas[6]}</td>
          `;
          tabela.appendChild(tr);
        }
      });
    };
    leitor.readAsText(arquivo);
  });

// 🎨 Atualiza automaticamente o estado e aplica cores conforme a data
function atualizarEstados() {
  const hoje = new Date();

  tabela.querySelectorAll("tr").forEach(linha => {
    const celEstado = linha.children[4];
    const celDataFinal = linha.children[6];

    if (!celEstado || !celDataFinal) return;

    const estado = celEstado.textContent.trim().toLowerCase();
    const dataTexto = celDataFinal.textContent.trim().replace(/"/g, "");
    const dataFinal = new Date(dataTexto);

    // 🕒 Se a data for inválida, ignora
    if (isNaN(dataFinal)) return;

    // 🔄 Verifica se deve mudar o estado automaticamente
    if (estado === "pendente" && hoje > dataFinal) {
      celEstado.textContent = "Atrasado";
    }

    // 🎨 Aplica cor de acordo com o estado atual
    const novoEstado = celEstado.textContent.trim().toLowerCase();
    celEstado.style.fontWeight = "bold";

    if (novoEstado === "pago") {
      celEstado.style.color = "green";
    } else if (novoEstado === "pendente") {
      celEstado.style.color = "orange";
    } else if (novoEstado === "atrasado") {
      celEstado.style.color = "red";
    } else {
      celEstado.style.color = "black";
      celEstado.style.fontWeight = "normal";
    }
  });
}

// ⏰ Atualiza a cada 3 segundos
setInterval(atualizarEstados, 3000);

// ⚡ E também atualiza na primeira renderização
atualizarEstados();
});

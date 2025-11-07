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
      <td contenteditable="true">${nome}</td>
      <td contenteditable="true">${email}</td>
      <td contenteditable="true">${produto}</td>
      <td contenteditable="true">${estado}</td>
      <td contenteditable="true">${dataInicial}</td>
      <td contenteditable="true">${dataFinal}</td>
    `;
    tabela.appendChild(novaLinha);

    // 📨 Enviar JSON para o backend (inserção)
    try {
      const resposta = await fetch("http://127.0.0.1:1880/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          produto,
          estado_pagamento: estado,
          data_inicial: dataInicial,
          data_final: dataFinal,
        }),
      });

      const data = await resposta.json();
      console.log("Cliente cadastrado:", data);
    } catch (erro) {
      console.error("Erro ao enviar pro servidor:", erro);
    }
  });

  // 💾 Exportar planilha para CSV
  btnExportar.addEventListener("click", () => {
    let csv = "";
    const linhas = document.querySelectorAll("#tabela tr");
    linhas.forEach((linha) => {
      const colunas = linha.querySelectorAll("th, td");
      const dados = Array.from(colunas).map((td) => `"${td.textContent}"`);
      csv += dados.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clientes.csv";
    link.click();
  });

  // Importar CSV e atualizar tabela + banco
  btnImportar.addEventListener("click", async () => {
    const arquivo = inputCSV.files[0];
    if (!arquivo) {
      alert("Escolha um arquivo CSV primeiro!");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = async (e) => {
      const conteudo = e.target.result;
      const linhas = conteudo.split("\n").filter((l) => l.trim() !== "");
      tabela.innerHTML = ""; // limpa tabela atual
      const clientes = [];

      linhas.slice(1).forEach((linha, index) => {
        const colunas = linha.split(",").map((c) => c.replace(/"/g, ""));
        if (colunas.length >= 7) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${colunas[0] || index + 1}</td>
            <td contenteditable="true">${colunas[1]}</td>
            <td contenteditable="true">${colunas[2]}</td>
            <td contenteditable="true">${colunas[3]}</td>
            <td contenteditable="true">${colunas[4]}</td>
            <td contenteditable="true">${colunas[5]}</td>
            <td contenteditable="true">${colunas[6]}</td>
          `;
          tabela.appendChild(tr);

          clientes.push({
            id_cliente: colunas[0] || index + 1,
            nome: colunas[1],
            email: colunas[2],
            produto: colunas[3],
            estado_pagamento: colunas[4],
            data_inicial: colunas[5],
            data_final: colunas[6],
          });
        }
      });

      // Enviar tudo para o backend
      try {
        await fetch("http://127.0.0.1:1880/clientes/sincronizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientes),
        });
        console.log("Banco sincronizado com CSV!");
      } catch (erro) {
        console.error("Erro ao sincronizar banco:", erro);
      }
    };
    leitor.readAsText(arquivo);
  });

  //  Atualizar banco ao editar uma célula
  tabela.addEventListener("blur", async (e) => {
    const celula = e.target;
    const linha = celula.closest("tr");
    if (!linha) return;

    const dados = {
      id_cliente: linha.children[0].textContent,
      nome: linha.children[1].textContent,
      email: linha.children[2].textContent,
      produto: linha.children[3].textContent,
      estado_pagamento: linha.children[4].textContent,
      data_inicial: linha.children[5].textContent,
      data_final: linha.children[6].textContent,
    };

    try {
      await fetch("http://127.0.0.1:1880/clientes/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      console.log("Cliente atualizado:", dados.nome);
    } catch (erro) {
      console.error("Erro ao atualizar cliente:", erro);
    }
  }, true);

  //  Atualiza automaticamente o estado e aplica cores conforme a data/estado
  function atualizarEstados() {
    const hoje = new Date();

    tabela.querySelectorAll("tr").forEach((linha) => {
      const celEstado = linha.children[4];
      const celDataFinal = linha.children[6];

      if (!celEstado || !celDataFinal) return;

      const estado = celEstado.textContent.trim().toLowerCase();
      const dataTexto = celDataFinal.textContent.trim().replace(/"/g, "");
      const dataFinal = new Date(dataTexto);

      if (isNaN(dataFinal)) return;

      if (estado === "pendente" && hoje > dataFinal) {
        celEstado.textContent = "Atrasado";
      }

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

  // Atualiza os estados a cada 3 segundos
  setInterval(atualizarEstados, 3000);
  atualizarEstados();
});

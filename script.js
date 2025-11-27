document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("tabela").querySelector("tbody");
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnExportar = document.getElementById("btnExportar");
  const btnImportar = document.getElementById("btnImportar");
  const inputCSV = document.getElementById("inputCSV");

  /* =====================================================
     1) GET – CARREGAR CLIENTES AO ABRIR A TELA
  ===================================================== */
  async function carregarClientes() {
    try {
      const resposta = await fetch("http://localhost:3306/clientes");
      const clientes = await resposta.json();

      tabela.innerHTML = "";

      clientes.forEach((c) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.id_cliente}</td>
          <td contenteditable="true">${c.nome}</td>
          <td contenteditable="true">${c.email}</td>
          <td contenteditable="true">${c.produto}</td>
          <td contenteditable="true">${c.estado_pagamento}</td>
          <td contenteditable="true">${c.data_inicial}</td>
          <td contenteditable="true">${c.data_final}</td>
          <td><button class="btnExcluir">Excluir</button></td>
        `;
        tabela.appendChild(tr);
      });
    } catch (erro) {
      console.error("Erro ao carregar clientes:", erro);
    }
  }

  carregarClientes();

  /* =====================================================
     2) POST – ADICIONAR NOVO CLIENTE
  ===================================================== */
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

    try {
      const resposta = await fetch("http://localhost:3306/clientes", {
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

      await resposta.json();
      carregarClientes();
    } catch (erro) {
      console.error("Erro ao enviar pro servidor:", erro);
    }
  });

  /* =====================================================
     3) DELETE – EXCLUIR LINHA
  ===================================================== */
  tabela.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("btnExcluir")) return;

    const linha = e.target.closest("tr");
    const id = linha.children[0].textContent;

    if (!confirm(`Excluir cliente ${id}?`)) return;

    try {
      await fetch(`http://localhost:3306/clientes/${id}`, {
        method: "DELETE",
      });

      linha.remove();
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
    }
  });

  /* =====================================================
     4) PUT – ATUALIZAR AO EDITAR CELULAR (contenteditable)
  ===================================================== */
  let timeout;
  tabela.addEventListener(
    "blur",
    async (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
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
          await fetch(
            `http://localhost:3306/clientes/${dados.id_cliente}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            }
          );
        } catch (erro) {
          console.error("Erro ao atualizar cliente:", erro);
        }
      }, 300);
    },
    true
  );

  /* =====================================================
     5) EXPORTAR CSV
  ===================================================== */
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

  /* =====================================================
     6) IMPORTAR CSV + SINCRONIZAR BACKEND
  ===================================================== */
  btnImportar.addEventListener("click", async () => {
    const arquivo = inputCSV.files[0];
    if (!arquivo) {
      alert("Escolha um arquivo CSV!");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = async (e) => {
      const conteudo = e.target.result;
      const linhas = conteudo.split("\n").filter((l) => l.trim() !== "");

      const clientes = [];

      tabela.innerHTML = "";

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
            <td><button class="btnExcluir">Excluir</button></td>
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

      try {
        await fetch("http://localhost:3306/clientes/sincronizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientes),
        });

        carregarClientes();
      } catch (erro) {
        console.error("Erro ao sincronizar CSV:", erro);
      }
    };

    leitor.readAsText(arquivo);
  });

  /* =====================================================
     7) ATUALIZAÇÃO AUTOMÁTICA DE ESTADO + CORES
  ===================================================== */
  function atualizarEstados() {
    const hoje = new Date();

    tabela.querySelectorAll("tr").forEach((linha) => {
      const celEstado = linha.children[4];
      const celDataFinal = linha.children[6];

      if (!celEstado || !celDataFinal) return;

      const estado = celEstado.textContent.trim().toLowerCase();
      const dataTexto = celDataFinal.textContent.trim();
      const dataFinal = new Date(dataTexto);

      if (!isNaN(dataFinal) && estado === "pendente" && hoje > dataFinal) {
        celEstado.textContent = "Atrasado";
      }

      const novoEstado = celEstado.textContent.trim().toLowerCase();
      celEstado.style.fontWeight = "bold";

      if (novoEstado === "pago") celEstado.style.color = "green";
      else if (novoEstado === "pendente") celEstado.style.color = "orange";
      else if (novoEstado === "atrasado") celEstado.style.color = "red";
      else celEstado.style.color = "black";
    });
  }

  setInterval(atualizarEstados, 3000);
  atualizarEstados();
});

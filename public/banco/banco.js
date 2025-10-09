async function enviarFinanceiro() {
    const nome = document.getElementById("nome").value;
    const cnpj = document.getElementById("cnpj").value;
    const faixa = document.getElementById("faixa").value;

    if (!nome || !cnpj || !faixa) {
      alert("Preencha todos os campos!");
      return;
    }

    const dados = { nome, cnpj, faixa };

    try {
      const resposta = await fetch("http://localhost:1880/insert-financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const resultado = await resposta.text();
      document.getElementById("resultado").innerText = resultado;
    } catch (erro) {
      document.getElementById("resultado").innerText = "Erro ao enviar: " + erro;
    }
  }
package model;

import java.time.LocalDate;

public class Cliente {

    private Long id_cliente;
    private String nome;
    private String email;
    private String produto;
    private String estado;
    private LocalDate data_inicial;
    private LocalDate data_final;

    public Cliente() {
    }

    public Cliente(Long id_cliente, String nome, String email, String produto,
            String estado, LocalDate data_inicial, LocalDate data_final) {
        this.id_cliente = id_cliente;
        this.nome = nome;
        this.email = email;
        this.produto = produto;
        this.estado = estado;
        this.data_inicial = data_inicial;
        this.data_final = data_final;
    }

    // ✅ GET E SET CORRETOS DO ID
    public Long getId_cliente() {
        return id_cliente;
    }

    public void setId_cliente(Long id_cliente) {
        this.id_cliente = id_cliente;
    }

    // ====== OUTROS GETTERS E SETTERS ======

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProduto() {
        return produto;
    }

    public void setProduto(String produto) {
        this.produto = produto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDate getData_inicial() {
        return data_inicial;
    }

    public void setData_inicial(LocalDate data_inicial) {
        this.data_inicial = data_inicial;
    }

    public LocalDate getData_final() {
        return data_final;
    }

    public void setData_final(LocalDate data_final) {
        this.data_final = data_final;
    }
}

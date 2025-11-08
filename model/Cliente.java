package model;
import java.util.Date;

public class Cliente {
    
    // Atributos
    private Long id;
    private String nome;
    private String email;
    private String produto;
    private String estado;
    private Date data_inicial;
    private Date data_final;

    // Construtor

    public Cliente(){
    }

    public Cliente(Long id, String nome, String email, String produto, String estado, Date data_inicial, Date data_final){
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.produto = produto;
        this.estado = estado;
        this.data_inicial = data_inicial;
        this.data_final = data_final;
    }

    public Cliente(String nome, String email, String produto, String estado, Date data_inicial, Date data_final){
        this.nome = nome;
        this.email = email;
        this.produto = produto;
        this.estado = estado;
        this.data_inicial = data_inicial;
        this.data_final = data_final;
    }

    // GETTERS E SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Date getData_inicial() {
        return data_inicial;
    }

    public void setData_inicial(Date data_inicial) {
        this.data_inicial = data_inicial;
    }

    public Date getData_final() {
        return data_final;
    }

    public void setData_final(Date data_final) {
        this.data_final = data_final;
    }

    @Override
    public String toString(){
        return "Cliente [id=" + id + ", nome= " + nome + ", email= " + email + ", produto= " + produto + ", estado= " + estado + ", data_inicial= " + data_inicial + ", data_final= " + data_final + "]";    
    }
}

package dao;

import java.beans.Statement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;

import model.Cliente;
import model.Produto;
import util.ConnectionFactory;

public class ClienteDAO {
    //-----------------------------------------------------------//
    // READ
    //-----------------------------------------------------------//

    public List<Cliente> buscarTodos(){

        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT * FROM clientes";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery();) {
            
            while(rs.next()){
                Cliente cliente = new Cliente(
                    rs.getLong("id"),
                    rs.getString("nome"),
                    rs.getString("email"),
                    rs.getString("produto"),
                    rs.getString("estado"),
                    rs.getDate("data_inicial"),
                    rs.getDate("data_final"));
                clientes.add(cliente);
            }

        } catch (SQLException e) {
            System.out.println("Erro ao buscar por clientes: " + e.getMessage());
            e.printStackTrace();
        }

        return clientes;
    }

    //-----------------------------------------------------------//
    // READ BY ID
    //-----------------------------------------------------------//
    
    public Cliente buscarPorId(Long id){

        Cliente cliente = null;

        String sql = "SELECT id, nome, email, produto, estado, data_inicial, data_final FROM cliente WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);) {
            
                stmt.setLong(1, id);

                try(ResultSet rs = stmt.executeQuery()){
                    if(rs.next()){
                        cliente = new Cliente(
                            rs.getLong("id"),
                            rs.getString("nome"),
                            rs.getString("email"),
                            rs.getString("produto"),
                            rs.getString("estado"),
                            rs.getDate("data_iniical"),
                            rs.getDate("data_final")
                        );
                    }
                }   

        } catch (SQLException e) {
            System.out.println("Erro ao buscar por cliente. ID: " + id);
            System.out.println(e.getMessage());
            e.getStackTrace();
        }
        return cliente;
    }

    //-----------------------------------------------------------//
    // CREATE
    //-----------------------------------------------------------//

    public void inserir(Cliente cliente){

        String sql = "INSERT INTO cliente(nome, email, produto, estado, data_inicial, data_final) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {

                stmt.setString(1, cliente.getNome());
                stmt.setString(2, cliente.getEmail());
                stmt.setString(3, cliente.getProduto());
                stmt.setString(4, cliente.getEstado());
                stmt.setDate(5, java.sql.Date.valueOf(cliente.getData_inicial()));
                stmt.setDate(6, java.sql.Date.valueOf(cliente.getData_final()));

                stmt.executeUpdate();

                try(ResultSet rs = stmt.getGeneratedKeys()){
                    if (rs.next()){
                        cliente.setId(rs.getLong(1));
                    }

                }
            
        } catch (SQLException e) {
            System.out.println("Erro ao inserir o cliente: " + cliente.getNome());
            System.out.println(e.getMessage());
            e.getStackTrace();
        }

    }
    //-----------------------------------------------------------//
    // UPDATE
    //-----------------------------------------------------------//

    public void atualizar(Cliente cliente){

        String sql = "UPDATE cliente SET nome = ?, email = ?, produto = ?, estado = ?, data_inicial = ?, data_final = ? WHERE id = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

                stmt.setString(1, cliente.getNome());
                stmt.setString(2, cliente.getEmail());
                stmt.setString(3, cliente.getProduto());
                stmt.setString(4, cliente.getEstado());
                stmt.setDate(5, java.sql.Date.valueOf(cliente.getData_inicial()));
                stmt.setDate(6, java.sql.Date.valueOf(cliente.getData_final()));        

                int linhasAfetadas = stmt.executeUpdate();
                System.out.println("Cliente ID: "+ cliente.getId() + " Atualizado.");
                System.out.println("Linhas afetadas: " + linhasAfetadas);

        } catch (SQLException e) {
            System.out.println("Erro ao atualizar o cliente: " + cliente.getNome());
            System.out.println(e.getMessage());
            e.getStackTrace();
        }

    }

    //-----------------------------------------------------------//
    // DELETE
    //-----------------------------------------------------------//

    public void deletar(Long id){
        
        String sql = "DELETE FROM produtos WHERE id = ?";
        
        try(Connection conn = ConnectionFactory.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql)){

                stmt.setLong(1, id);

                int linhasAfetadas = stmt.executeUpdate();
                System.out.println("Produto excluido id: "+ id);

                System.out.println("Linhas afetadas: " + linhasAfetadas);
        } catch (Exception e) {
            System.out.println("Erro ao excluir produto ID: " + id);
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }

}



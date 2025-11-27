package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import model.Cliente;
import util.ConnectionFactory;

public class ClienteDAO {

    public List<Cliente> buscarTodos() {
        List<Cliente> clientes = new ArrayList<>();
        String sql = "SELECT * FROM clientes";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Cliente cliente = new Cliente(
                        rs.getLong("id_cliente"),
                        rs.getString("nome"),
                        rs.getString("email"),
                        rs.getString("produto"),
                        rs.getString("estado"),
                        rs.getDate("data_inicial").toLocalDate(),
                        rs.getDate("data_final").toLocalDate()
                );
                clientes.add(cliente);
            }

        } catch (SQLException e) {
            System.out.println("Erro ao buscar clientes: " + e.getMessage());
        }

        return clientes;
    }

    public Cliente buscarPorId(Long id) {
        Cliente cliente = null;
        String sql = "SELECT * FROM clientes WHERE id_cliente = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    cliente = new Cliente(
                            rs.getLong("id_cliente"),
                            rs.getString("nome"),
                            rs.getString("email"),
                            rs.getString("produto"),
                            rs.getString("estado"),
                            rs.getDate("data_inicial").toLocalDate(),
                            rs.getDate("data_final").toLocalDate()
                    );
                }
            }

        } catch (SQLException e) {
            System.out.println("Erro ao buscar cliente por ID: " + e.getMessage());
        }

        return cliente;
    }

    public void inserir(Cliente cliente) {
        String sql = "INSERT INTO clientes (nome, email, produto, estado, data_inicial, data_final) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, cliente.getNome());
            stmt.setString(2, cliente.getEmail());
            stmt.setString(3, cliente.getProduto());
            stmt.setString(4, cliente.getEstado());
            stmt.setDate(5, java.sql.Date.valueOf(cliente.getData_inicial()));
            stmt.setDate(6, java.sql.Date.valueOf(cliente.getData_final()));

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    cliente.setId(rs.getLong(1));
                }
            }

        } catch (SQLException e) {
            System.out.println("Erro ao inserir cliente: " + e.getMessage());
        }
    }

    public void atualizar(Cliente cliente) {
        String sql = "UPDATE clientes SET nome=?, email=?, produto=?, estado=?, data_inicial=?, data_final=? WHERE id_cliente=?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cliente.getNome());
            stmt.setString(2, cliente.getEmail());
            stmt.setString(3, cliente.getProduto());
            stmt.setString(4, cliente.getEstado());
            stmt.setDate(5, java.sql.Date.valueOf(cliente.getData_inicial()));
            stmt.setDate(6, java.sql.Date.valueOf(cliente.getData_final()));
            stmt.setLong(7, cliente.getId());

            stmt.executeUpdate();

        } catch (SQLException e) {
            System.out.println("Erro ao atualizar cliente: " + e.getMessage());
        }
    }

    public void deletar(Long id) {
        String sql = "DELETE FROM clientes WHERE id_cliente = ?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            System.out.println("Erro ao deletar cliente: " + e.getMessage());
        }
    }
}

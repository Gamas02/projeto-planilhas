package api;

import static spark.Spark.*;

import java.time.LocalDate;

import spark.Request;
import spark.Response;
import spark.Route;
import spark.Filter;
import dao.ClienteDAO;
import model.Cliente;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializer;

public class ApiCliente {

    // instancia do DAO e o GSON
    private static final ClienteDAO clienteDao = new ClienteDAO();
    private static Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class,
                    (JsonSerializer<LocalDate>) (src, typeOfSrc, context) -> new JsonPrimitive(src.toString()))
            .registerTypeAdapter(LocalDate.class,
                    (JsonDeserializer<LocalDate>) (json, typeOfT, context) -> LocalDate.parse(json.getAsString()))
            .create();

    // constante para garantir que todas as respostas sejam JSON
    private static final String APPLICATION_JSON = "application/json";

    public static void main(String[] args) {

        // configuração do Servidor
        port(4567); // Define a porta da API. Acesso via http://localhost:4567

        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        });

        // filtro para definir o tipo de conteúdo como JSON
        after(new Filter() {
            @Override
            public void handle(Request request, Response response) {
                response.type(APPLICATION_JSON);
            }
        });

        // GET /clientes - Buscar todos os clientes
        get("/clientes", new Route() {
            @Override
            public Object handle(Request request, Response response) {
                return gson.toJson(clienteDao.buscarTodos());
            }
        });

        // GET /clientes/:id - Buscar por ID
        get("/clientes/:id", new Route() {
            @Override
            public Object handle(Request request, Response response) {
                try {
                    // converter o parâmetro da URL (String) para Long, que é o tipo do ID
                    Long id = Long.parseLong(request.params(":id"));

                    Cliente cliente = clienteDao.buscarPorId(id); // Usa o Long ID

                    if (cliente != null) {
                        return gson.toJson(cliente);
                    } else {
                        response.status(404); // Not Found
                        return "{\"mensagem\": \"Cliente com ID " + id + " não encontrado\"}";
                    }
                } catch (NumberFormatException e) {
                    response.status(400); // Bad Request
                    return "{\"mensagem\": \"Formato de ID inválido.\"}";
                }
            }
        });

        post("/clientes/sincronizar", (request, response) -> {
            try {
                Cliente[] clientes = gson.fromJson(request.body(), Cliente[].class);

                for (Cliente c : clientes) {

                    if (c.getId() != null && clienteDao.buscarPorId(c.getId()) != null) {
                        clienteDao.atualizar(c);
                    } else {
                        clienteDao.inserir(c);
                    }
                }

                response.status(200);
                return "{\"mensagem\": \"Sincronizado com sucesso\"}";

            } catch (Exception e) {
                e.printStackTrace();
                response.status(500);
                return "{\"mensagem\": \"Erro ao sincronizar CSV\"}";
            }
        });

        // PUT /produtos/:id - Atualizar cliente existente
        put("/clientes/:id", new Route() {
            @Override
            public Object handle(Request request, Response response) {
                try {
                    Long id = Long.parseLong(request.params(":id")); // Usa Long

                    if (clienteDao.buscarPorId(id) == null) {
                        response.status(404);
                        return "{\"mensagem\": \"Cliente não encontrado para atualização.\"}";
                    }

                    Cliente clienteParaAtualizar = gson.fromJson(request.body(), Cliente.class);
                    clienteParaAtualizar.setId(id); // garante que o ID da URL seja usado

                    clienteDao.atualizar(clienteParaAtualizar);

                    response.status(200); // OK
                    return gson.toJson(clienteParaAtualizar);

                } catch (NumberFormatException e) {
                    response.status(400); // Bad Request
                    return "{\"mensagem\": \"Formato de ID inválido.\"}";
                } catch (Exception e) {
                    response.status(500);
                    System.err.println("Erro ao processar requisição PUT: " + e.getMessage());
                    e.printStackTrace();
                    return "{\"mensagem\": \"Erro ao atualizar cliente.\"}";
                }
            }
        });

        // DELETE /clientes/:id - Deletar um cliente
        delete("/clientes/:id", new Route() {
            @Override
            public Object handle(Request request, Response response) {
                try {
                    Long id = Long.parseLong(request.params(":id")); // Usa Long

                    if (clienteDao.buscarPorId(id) == null) {
                        response.status(404);
                        return "{\"mensagem\": \"Cliente não encontrado para exclusão.\"}";
                    }

                    clienteDao.deletar(id); // Usa o Long ID

                    response.status(204); // No Content
                    return ""; // Corpo vazio

                } catch (NumberFormatException e) {
                    response.status(400);
                    return "{\"mensagem\": \"Formato de ID inválido.\"}";
                }
            }
        });
    }
}
package api;

import static spark.Spark.*;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Filter;

import com.google.gson.Gson;

import dao.ProdutoDAO;
import model.Produto;

public class ApiProduto {

    private static final ProdutoDAO dao = new ProdutoDAO();
    private static final Gson gson = new Gson();

    private static final String APPLICATION_JSON = "application/json";

    public static void main(String[] args) {
        port(4567);
        after(new Filter(){

            @Override
            public void handle(Request request, Response response){
                response.type(APPLICATION_JSON);
            }
        });

        // GET /produtos - Buscar Todos
        get("/produtos", new Route() {
            
            @Override
            public Object handle(Request request, Response response){
                return(gson.toJson(dao.buscarTodos()));
            }
        });

        // GET /produtos/id - Buscar por id
        get("/produtos/:id", new Route(){
            @Override
            public Object handle(Request request, Response response){
                try{
                    Long id = Long.parseLong(request.params(":id"));
                    Produto produto = dao.buscarPorId(id);
                    if (produto != null){
                        return(gson.toJson(produto));
                    }
                    else {
                        response.status(404);
                        return "(\"mensagem\": \"Produto com ID "+ id + " não encontrado.\")";
                    }
                }catch(NumberFormatException e){
                    response.status(400);
                    return "(\"mensagem\": \"Formato do ID invalido\")";
                }
            };
        });

        // POST /produtos - Criar novo produto
        post("/produtos", new Route(){
            @Override
            public Object handle(Request request, Response response){
                try{
                    Produto novoProduto = gson.fromJson(request.body(), Produto.class);
                    dao.inserir(novoProduto);
                    
                    response.status(201);
                    return gson.toJson(novoProduto);
                    
                } catch(Exception e){
                    response.status(500);
                    System.out.println("Erro ao processar requisição POST");
                    System.out.println(e.getMessage());
                    e.printStackTrace();
                    return "(\"mensagem\": \"Erro ao criar produto\")";
                }
            };
        });
    };
}

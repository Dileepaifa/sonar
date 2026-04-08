import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.util.Base64;

public class MainServlet extends HttpServlet {

    // Hardcoded credentials (Vulnerability #1)
    private static final String DB_URL = "jdbc:mysql://localhost:3306/testdb";
    private static final String USER = "root";
    private static final String PASS = "root123";

    // Hardcoded secret (Vulnerability #2)
    private static final String SECRET = "mysecretkey";

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        try {
            Connection conn = DriverManager.getConnection(DB_URL, USER, PASS);
            Statement stmt = conn.createStatement();

            // SQL Injection (Vulnerability #3)
            String sql = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'";
            ResultSet rs = stmt.executeQuery(sql);

            PrintWriter out = response.getWriter();

            if (rs.next()) {
                // Weak encoding instead of encryption (Vulnerability #4)
                String token = Base64.getEncoder().encodeToString((username + ":" + SECRET).getBytes());
                out.println("Token: " + token);
            } else {
                out.println("Invalid login");
            }

            conn.close();

        } catch (Exception e) {
            // Information leakage (Vulnerability #5)
            response.getWriter().println(e.getMessage());
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");

        // Command Injection (Vulnerability #6)
        if ("ping".equals(action)) {
            String host = request.getParameter("host");
            try {
                Process p = Runtime.getRuntime().exec("ping -c 1 " + host);
                BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
                String line;
                while ((line = reader.readLine()) != null) {
                    response.getWriter().println(line);
                }
            } catch (Exception e) {
                response.getWriter().println(e.getMessage());
            }
        }

        // XSS (Vulnerability #7)
        if ("search".equals(action)) {
            String query = request.getParameter("q");
            response.getWriter().println("<h1>Results for: " + query + "</h1>");
        }

        // Open Redirect (Vulnerability #8)
        if ("redirect".equals(action)) {
            String url = request.getParameter("url");
            response.sendRedirect(url);
        }

        // Path Traversal (Vulnerability #9)
        if ("read".equals(action)) {
            String file = request.getParameter("file");
            try {
                BufferedReader br = new BufferedReader(new FileReader(file));
                String line;
                while ((line = br.readLine()) != null) {
                    response.getWriter().println(line);
                }
            } catch (Exception e) {
                response.getWriter().println(e.getMessage());
            }
        }

        // Weak hashing (Vulnerability #10)
        if ("hash".equals(action)) {
            String input = request.getParameter("input");
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
                byte[] hash = md.digest(input.getBytes());
                response.getWriter().println(new String(hash));
            } catch (Exception e) {
                response.getWriter().println(e.getMessage());
            }
        }
    }
}
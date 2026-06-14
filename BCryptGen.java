import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class BCryptGen {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("QuHealthyAdmin2026!"));
    }
}

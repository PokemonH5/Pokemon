import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;

public class PlayerInfoDAO {
	
	public static int[] getPlayerLastPos() throws IOException{
		int pos[] = new int[2];
		File file = new File("PlayerInfo.txt");
		if (file.exists() && file.isFile()) {
			InputStreamReader read = new InputStreamReader(new FileInputStream(file));
			BufferedReader bufferedReader = new BufferedReader(read);
			pos[0] = bufferedReader.read();
			pos[1] = bufferedReader.read();
		}else {
			pos[0] = -1;
			pos[1] = -1;
		}
		
		return pos;
	}
	
	public static boolean setPlayerLastPos(int[] pos) throws IOException{
		
		File file = new File("PlayerInfo.txt");
		if (!file.exists()) {
			file.createNewFile();
		}
		System.out.println(file.getAbsolutePath());
		FileWriter fWriter = new FileWriter(file);
		BufferedWriter bufferedWriter = new BufferedWriter(fWriter);
		bufferedWriter.write(pos[0]);
		bufferedWriter.write(pos[1]);
		bufferedWriter.close();
		return true;
	}
}

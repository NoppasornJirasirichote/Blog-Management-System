import styles from '../styles.module.css';
import { MdPeople } from "react-icons/md";

const Header = ({ username, searchTerm, handleInputChange, handleSubmit, email }) => {
    return (
        <header className={styles.head1}>
            <form onSubmit={handleSubmit} style={{ justifyContent: "center", width: "100%",  }}>
                <input
                    className={styles.searchbox}
                    type="search"
                    placeholder="search blog"
                    value={searchTerm}
                    onChange={handleInputChange}
                    style={{ marginRight: "10px" }}
                />
                <button type="submit" style={{ width: "100px", height: "35px", fontSize: "16px" }}>Submit</button>
            </form>
            <div style={{ width: "18%", marginLeft: "-18%", display: "flex", marginTop: "12px" }}>
                <div style={{ paddingRight: "5px", paddingTop: "4px" }}>
                    <MdPeople />
                </div>
                <span className={styles.text1}> {username}</span>
            </div>
           
        </header>
    );
};

export default Header;
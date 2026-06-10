from flask import Flask, render_template, request, redirect, url_for, flash, session
import bcrypt
import mysql.connector
app = Flask(__name__)
app.secret_key = "chave_secreta"

def conectar_bd():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="almoxarifado"
    )

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]
        conexao = conectar_bd()
        cursor = conexao.cursor()
        cursor.execute("SELECT senha_hash, permissao FROM usuarios WHERE email = %s", (email,))
        resultado = cursor.fetchone()
        cursor.close()
        conexao.close()
        if resultado and bcrypt.checkpw(senha.encode("utf-8"), resultado[0].encode("utf-8")):
            session["permissao"] = resultado[1]
            session["email"] = email
            return redirect(url_for("home"))
        else:
            flash("Email ou senha incorretos.", "danger")
    return render_template("login.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/tblmove")
def tblmove():
    return render_template("tblmove.html")

@app.route("/cadastroadm", methods=["GET", "POST"])
def cadastro():
    if session.get("permissao") != "admin":
        return redirect(url_for("home"))
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]
        permissao = request.form["permissao"]
        senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt())
        conexao = conectar_bd()
        cursor = conexao.cursor()
        cursor.execute(
            "INSERT INTO usuarios (email, senha_hash, permissao) VALUES (%s, %s, %s)",
            (email, senha_hash, permissao)
        )
        conexao.commit()
        cursor.close()
        conexao.close()
        flash("Usuário cadastrado com sucesso!", "success")
        return redirect(url_for("cadastro"))
    return render_template("cadastro.html")

@app.route("/tblvizu")
def tblvizu():
    conexao = conectar_bd()
    cursor = conexao.cursor()
    cursor.execute("SELECT ID, NOME, QNTD, ESTOQUE_MINIMO, DESCRICAO, PRECO, FOTO, CATEGORIA FROM tblvizu")
    itens = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template("tblvizu.html", itens=itens)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
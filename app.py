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

@app.route("/tbladd", methods=["GET", "POST"])
def tbladd():
    if request.method == "POST":
        nome = request.form["nome"]
        qntd = request.form["qntd"]
        estoque_minimo = request.form["estoque_minimo"]
        descricao = request.form["descricao"]
        preco = request.form["preco"]
        categoria = request.form["categoria"]
        foto = request.files["foto"]

        nome_foto = foto.filename
        foto.save("static/fotos/" + nome_foto)

        conexao = conectar_bd()
        cursor = conexao.cursor()
        cursor.execute(
            "INSERT INTO tblvizu (NOME, QNTD, ESTOQUE_MINIMO, DESCRICAO, PRECO, FOTO, CATEGORIA) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (nome, qntd, estoque_minimo, descricao, preco, nome_foto, categoria)
        )
        conexao.commit()
        cursor.close()
        conexao.close()
        flash("Item adicionado com sucesso!", "success")
        return redirect(url_for("tbladd"))
    return render_template("tbladd.html")

@app.route("/tblmove", methods=["GET", "POST"])
def tblmove():
    conexao = conectar_bd()
    cursor = conexao.cursor(dictionary=True)
    if request.method == "POST":
        item = request.form["item"]
        qntd = int(request.form["qntd"])
        tipo = request.form["tipo"]
        almoxarife = request.form["almoxarife"]
        finalidade = request.form["finalidade"]
        cursor.execute(
            "INSERT INTO tblmove (ITEM, QNTD, ALMOXARIFE, TIPO, FINALIDADE) VALUES (%s, %s, %s, %s, %s)",
            (item, qntd, almoxarife, tipo, finalidade)
        )
        sinal = "+" if tipo == "entrada" else "-"
        cursor.execute(f"UPDATE tblvizu SET QNTD = QNTD {sinal} %s WHERE NOME = %s", (qntd, item))
        conexao.commit()
        flash("Movimentação registrada com sucesso!", "success")
        return redirect(url_for("tblmove"))
    cursor.execute("SELECT NOME, QNTD FROM tblvizu")
    itens = cursor.fetchall()
    cursor.execute("SELECT * FROM tblmove ORDER BY ID DESC")
    movs = cursor.fetchall()
    conexao.close()
    return render_template("tblmove.html", itens=itens, movs=movs)

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
    cursor = conexao.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tblvizu")
    itens = cursor.fetchall()
    cursor.close()
    conexao.close()
    return render_template("tblvizu.html", itens=itens)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
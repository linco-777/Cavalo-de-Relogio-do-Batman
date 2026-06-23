from flask import Flask, render_template, request, redirect, url_for, flash, session
import bcrypt
import mysql.connector

app = Flask(__name__)
app.secret_key = "chave_secreta"

def bd():
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
        con = bd()
        cur = con.cursor()
        cur.execute("SELECT senha_hash, permissao FROM usuarios WHERE email = %s", (email,))
        user = cur.fetchone()
        con.close()
        if user and bcrypt.checkpw(senha.encode(), user[0].encode()):
            session["permissao"] = user[1]
            session["email"] = email
            return redirect("/home")
        flash("Email ou senha incorretos.", "danger")
    return render_template("login.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/tbladd", methods=["GET", "POST"])
def tbladd():
    if request.method == "POST":
        con = bd()
        cur = con.cursor()
        cur.execute(
            "INSERT INTO tblvizu (NOME, QNTD, ESTOQUE_MINIMO, DESCRICAO, PRECO, FOTO, CATEGORIA) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (request.form["nome"], request.form["qntd"], request.form["estoque_minimo"],
             request.form["descricao"], request.form["preco"], request.form["foto"], request.form["categoria"])
        )
        con.commit()
        con.close()
        flash("Item adicionado!", "success")
        return redirect("/tbladd")
    return render_template("tbladd.html")

@app.route("/tblvizu")
def tblvizu():
    con = bd()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM tblvizu")
    itens = cur.fetchall()
    con.close()
    return render_template("tblvizu.html", itens=itens)

@app.route("/tblmove", methods=["GET", "POST"])
def tblmove():
    con = bd()
    cur = con.cursor(dictionary=True)
    if request.method == "POST":
        item = request.form["item"]
        qntd = int(request.form["qntd"])
        tipo = request.form["tipo"]
        cur.execute(
            "INSERT INTO tblmove (ITEM, QNTD, ALMOXARIFE, TIPO, FINALIDADE) VALUES (%s, %s, %s, %s, %s)",
            (item, qntd, request.form["almoxarife"], tipo, request.form["finalidade"])
        )
        sinal = "+" if tipo == "entrada" else "-"
        cur.execute(f"UPDATE tblvizu SET QNTD = QNTD {sinal} %s WHERE NOME = %s", (qntd, item))
        con.commit()
        flash("Movimentação registrada!", "success")
        return redirect("/tblmove")
    cur.execute("SELECT NOME, QNTD FROM tblvizu")
    itens = cur.fetchall()
    cur.execute("SELECT * FROM tblmove ORDER BY ID DESC")
    movs = cur.fetchall()
    con.close()
    return render_template("tblmove.html", itens=itens, movs=movs)

@app.route("/cadastroadm", methods=["GET", "POST"])
def cadastro():
    if session.get("permissao") != "admin":
        return redirect("/home")
    if request.method == "POST":
        senha_hash = bcrypt.hashpw(request.form["senha"].encode(), bcrypt.gensalt())
        con = bd()
        cur = con.cursor()
        cur.execute(
            "INSERT INTO usuarios (email, senha_hash, permissao) VALUES (%s, %s, %s)",
            (request.form["email"], senha_hash, request.form["permissao"])
        )
        con.commit()
        con.close()
        flash("Usuário cadastrado!", "success")
        return redirect("/cadastroadm")
    return render_template("cadastro.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
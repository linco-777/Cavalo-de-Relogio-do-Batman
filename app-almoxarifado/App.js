import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, Alert, ScrollView } from 'react-native';

const API = 'http://10.154.20.44:5000';

export default function App() {
  const [tela, setTela] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [movs, setMovs] = useState([]);
  const [nome, setNome] = useState('');
  const [qntd, setQntd] = useState('');
  const [estoque_minimo, setEstoqueMinimo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('geral');
  const [movItem, setMovItem] = useState('');
  const [movQntd, setMovQntd] = useState('');
  const [movTipo, setMovTipo] = useState('entrada');
  const [movAlmoxarife, setMovAlmoxarife] = useState('');
  const [movFinalidade, setMovFinalidade] = useState('');

  async function fazerLogin() {
    try {
      const resposta = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const dados = await resposta.json();
      if (dados.status === 'sucesso') {
        buscarProdutos();
        setTela('produtos');
      } else {
        Alert.alert('Erro', dados.mensagem);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível conectar à API.');
    }
  }

  async function buscarProdutos() {
    const resposta = await fetch(`${API}/api/produtos`);
    const dados = await resposta.json();
    setProdutos(dados);
  }

  async function buscarMovimentacoes() {
    const resposta = await fetch(`${API}/api/movimentacoes`);
    const dados = await resposta.json();
    setMovs(dados);
  }

  async function cadastrarProduto() {
    const resposta = await fetch(`${API}/api/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, qntd: parseInt(qntd), estoque_minimo: parseInt(estoque_minimo), descricao, preco: parseFloat(preco), foto: '', categoria })
    });
    const dados = await resposta.json();
    Alert.alert(dados.mensagem);
    buscarProdutos();
    setNome(''); setQntd(''); setEstoqueMinimo(''); setDescricao(''); setPreco('');
  }

  async function registrarMovimentacao() {
    const resposta = await fetch(`${API}/api/movimentacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: movItem, qntd: parseInt(movQntd), tipo: movTipo, almoxarife: movAlmoxarife, finalidade: movFinalidade })
    });
    const dados = await resposta.json();
    Alert.alert(dados.mensagem);
    buscarProdutos();
    buscarMovimentacoes();
    setMovItem(''); setMovQntd(''); setMovAlmoxarife(''); setMovFinalidade('');
  }

  if (tela === 'login') {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitulo}>Almoxarifado SENAI</Text>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
        <Button title="Entrar" onPress={fazerLogin} color="#192A6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navBtn} onPress={() => { setTela('produtos'); buscarProdutos(); }}>Estoque</Text>
        <Text style={styles.navBtn} onPress={() => setTela('cadastro')}>Cadastrar</Text>
        <Text style={styles.navBtn} onPress={() => { setTela('movimentacoes'); buscarMovimentacoes(); }}>Movimentações</Text>
        <Text style={styles.navBtn} onPress={() => setTela('login')}>Sair</Text>
      </View>

      {tela === 'produtos' && (
        <View style={styles.content}>
          <Text style={styles.titulo}>Estoque Atual</Text>
          <Button title="Atualizar" onPress={buscarProdutos} color="#192A6B" />
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.ID.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemNome}>{item.NOME}</Text>
                <Text>Quantidade: {item.QNTD}</Text>
                <Text>Categoria: {item.CATEGORIA}</Text>
                <Text>Preço: R$ {item.PRECO}</Text>
              </View>
            )}
          />
        </View>
      )}

      {tela === 'cadastro' && (
        <ScrollView style={styles.content}>
          <Text style={styles.titulo}>Cadastrar Item</Text>
          <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="Quantidade" value={qntd} onChangeText={setQntd} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Estoque Mínimo" value={estoque_minimo} onChangeText={setEstoqueMinimo} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
          <TextInput style={styles.input} placeholder="Preço" value={preco} onChangeText={setPreco} keyboardType="numeric" />
          <Button title="Cadastrar" onPress={cadastrarProduto} color="#FF9500" />
        </ScrollView>
      )}

      {tela === 'movimentacoes' && (
        <ScrollView style={styles.content}>
          <Text style={styles.titulo}>Registrar Movimentação</Text>
          <TextInput style={styles.input} placeholder="Nome do Item" value={movItem} onChangeText={setMovItem} />
          <TextInput style={styles.input} placeholder="Quantidade" value={movQntd} onChangeText={setMovQntd} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Tipo: entrada ou saída" value={movTipo} onChangeText={setMovTipo} />
          <TextInput style={styles.input} placeholder="Almoxarife" value={movAlmoxarife} onChangeText={setMovAlmoxarife} />
          <TextInput style={styles.input} placeholder="Finalidade" value={movFinalidade} onChangeText={setMovFinalidade} />
          <Button title="Registrar" onPress={registrarMovimentacao} color="#FF9500" />
          <Text style={styles.titulo}>Histórico</Text>
          {movs.map((mov) => (
            <View key={mov.ID.toString()} style={styles.item}>
              <Text style={styles.itemNome}>{mov.ITEM}</Text>
              <Text>Quantidade: {mov.QNTD}</Text>
              <Text>Tipo: {mov.TIPO}</Text>
              <Text>Almoxarife: {mov.ALMOXARIFE}</Text>
              <Text>Finalidade: {mov.FINALIDADE}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  loginTitulo: { fontSize: 26, fontWeight: 'bold', color: '#192A6B', textAlign: 'center', marginBottom: 30 },
  container: { flex: 1, backgroundColor: '#fff' },
  navbar: { flexDirection: 'row', backgroundColor: '#192A6B', paddingTop: 50, paddingBottom: 15, justifyContent: 'space-around' },
  navBtn: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#192A6B', marginBottom: 15, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  item: { backgroundColor: '#f0f4ff', padding: 15, marginBottom: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#192A6B' },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#192A6B' }
});
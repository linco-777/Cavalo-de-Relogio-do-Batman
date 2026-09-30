import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, Alert } from 'react-native';

const API = 'http://10.154.20.27:5000';

export default function App() {
  const [tela, setTela] = useState('produtos');
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [qntd, setQntd] = useState('');
  const [estoque_minimo, setEstoqueMinimo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('geral');

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    const resposta = await fetch(`${API}/api/produtos`);
    const dados = await resposta.json();
    setProdutos(dados);
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

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navBtn} onPress={() => setTela('produtos')}>Estoque</Text>
        <Text style={styles.navBtn} onPress={() => setTela('cadastro')}>Cadastrar</Text>
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
        <View style={styles.content}>
          <Text style={styles.titulo}>Cadastrar Item</Text>
          <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="Quantidade" value={qntd} onChangeText={setQntd} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Estoque Mínimo" value={estoque_minimo} onChangeText={setEstoqueMinimo} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
          <TextInput style={styles.input} placeholder="Preço" value={preco} onChangeText={setPreco} keyboardType="numeric" />
          <Button title="Cadastrar" onPress={cadastrarProduto} color="#FF9500" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navbar: { flexDirection: 'row', backgroundColor: '#192A6B', paddingTop: 50, paddingBottom: 15, justifyContent: 'space-around' },
  navBtn: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#192A6B', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  item: { backgroundColor: '#f0f4ff', padding: 15, marginBottom: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#192A6B' },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#192A6B' }
});
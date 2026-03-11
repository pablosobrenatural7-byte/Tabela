from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import json
import os
from functools import wraps

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = ':x_.H}kS+%it-£4|u5hk"tmkot\"w~aL4r2Z5y0B;4T|rPsMyd_'

DB_USUARIOS = 'usuarios_db.json'
DB_PRECOS = 'precos.json'
ARQUIVO_PEDIDOS = 'pedidos_salvos.txt'

def carregar_dados(arquivo, padrao=[]):
    if not os.path.exists(arquivo):
        with open(arquivo, 'w') as f: json.dump(padrao, f)
        return padrao
    with open(arquivo, 'r') as f: return json.load(f)

def salvar_dados(arquivo, dados):
    with open(arquivo, 'w') as f: json.dump(dados, f, indent=4)

def token_obrigatorio(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or 'Bearer ' not in token:
            return jsonify({'mensagem': 'Acesso negado!'}), 401
        try:
            token_puro = token.split()[1]
            jwt.decode(token_puro, app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return jsonify({'mensagem': 'Token expirado!'}), 401
        return f(*args, **kwargs)
    return decorador

@app.route('/api/login', methods=['POST'])
def login_admin():
    dados = request.get_json()
    if dados.get('username') == 'admin' and dados.get('password') == '132465As@':
        token = jwt.encode({'user': 'raul', 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
        return jsonify({'token': token})
    return jsonify({'erro': 'Login invalido'}), 401

@app.route('/api/login_usuario', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    num, senha = str(dados.get('numero')), dados.get('senha')
    usuarios = carregar_dados(DB_USUARIOS)
    user = next((u for u in usuarios if str(u['numero']) == num and u['senha'] == senha), None)
    if user:
        return jsonify({'nome': user['nome'], 'numero': user['numero'], 'contato': user.get('contato', '')})
    return jsonify({'erro': 'Falha'}), 401

@app.route('/api/usuarios/atualizar_contato', methods=['POST'])
def atualizar_contato():
    dados = request.get_json()
    num, contato = str(dados.get('numero')), dados.get('contato')
    usuarios = carregar_dados(DB_USUARIOS)
    for u in usuarios:
        if str(u['numero']) == num:
            u['contato'] = contato
            break
    salvar_dados(DB_USUARIOS, usuarios)
    return jsonify({'status': 'ok'})

@app.route('/api/precos', methods=['GET'])
def listar_precos():
    return jsonify(carregar_dados(DB_PRECOS))

@app.route('/api/precos/atualizar', methods=['POST'])
@token_obrigatorio
def atualizar_preco():
    dados = request.get_json()
    nome, preco, categoria = dados.get('nome'), dados.get('preco'), dados.get('categoria', 'Geral')
    precos = carregar_dados(DB_PRECOS)
    atualizado = False
    for p in precos:
        if p['nome'] == nome:
            p['preco'], p['categoria'] = preco, categoria
            atualizado = True; break
    if not atualizado: precos.append({'nome': nome, 'preco': preco, 'categoria': categoria})
    salvar_dados(DB_PRECOS, precos)
    return jsonify({'status': 'ok'})

@app.route('/api/precos/remover', methods=['POST'])
@token_obrigatorio
def remover_preco():
    dados = request.get_json()
    nome = dados.get('nome')
    precos = carregar_dados(DB_PRECOS)
    precos = [p for p in precos if p['nome'] != nome]
    salvar_dados(DB_PRECOS, precos)
    return jsonify({'status': 'removido'})

@app.route('/api/pedidos', methods=['POST'])
def receber_pedido():
    dados = request.get_json()
    itens, num_cliente = dados.get('items', []), str(dados.get('numero', ''))
    
    # Carrega os usuários para buscar os detalhes do cliente
    usuarios = carregar_dados(DB_USUARIOS)
    cliente = next((u for u in usuarios if str(u.get('numero')) == num_cliente), None)
    
    # Extrai os dados ou define padrões caso não encontre
    nome = cliente['nome'] if cliente else "Desconhecido"
    contato = cliente.get('contato', 'NÃO INFORMADO')
    senha_usuario = cliente.get('senha', 'N/A') # PEGA A SENHA AQUI
    
    data = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    
    # Monta a mensagem para o arquivo TXT
    msg = f"=== PEDIDO ({data}) ===\n"
    msg += f"Nome: {nome} | RA: {num_cliente} | Senha: {senha_usuario}\n"
    msg += f"Contato: {contato}\n \n" # ADICIONADO NO LOG
    msg += "Itens:\n"
    
    for i in itens: 
        msg += f"- {i['nome']}: R$ {i['preco']:.2f}\n"
    
    msg += f"TOTAL: R$ {sum(i['preco'] for i in itens):.2f}\n"
    msg += "-"*30 + "\n\n"
    
    # Salva no arquivo
    with open(ARQUIVO_PEDIDOS, 'a', encoding='utf-8') as f: 
        f.write(msg)
        
    return jsonify({"status": "sucesso"})
if __name__ == '__main__':
    app.run(debug=True, port=5000)
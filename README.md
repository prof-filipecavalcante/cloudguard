# CloudGuard Lab

Plataforma estática para aula prática de Segurança da Informação e Cloud Security.

## Publicar no GitHub Pages

1. Crie um repositório público no GitHub.
2. Na pasta deste projeto, execute:

```powershell
git init
git add .
git commit -m "feat: inicializa CloudGuard Lab"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
git push -u origin main
```

3. No GitHub, abra `Settings > Pages`.
4. Em `Build and deployment`, selecione `GitHub Actions`.
5. Execute o workflow `Deploy static site to GitHub Pages`.

## Acesso de teste

- Matrícula: `99999999`
- Nome: `Aluno Teste`

## Segurança e limitações

Este projeto é um laboratório educacional estático. Ele possui CSP, validação de matrícula, sessão por aba, cronômetro de 25 minutos e limite de três tentativas por matrícula no navegador.

Não use esta versão para provas, notas ou controle de presença. Como as flags, matrículas e regras são entregues ao navegador, alguém com conhecimento técnico pode inspecionar o código, alterar `localStorage` ou modificar o JavaScript. Para segurança real, mova autenticação, flags, tentativas, timer e registro de resultados para um backend com HTTPS, banco de dados, sessões HttpOnly e autorização no servidor.

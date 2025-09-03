# Contratos Seguros (N693)

Aplicação web para criação, assinatura e gestão de contratos com foco em segurança e LGPD.

## 1. Equipe
- JOSÉ MARCONDES RODRIGUES DA SILVA JÚNIOR - 2326642 - Desenvolvedor
- JOÃO PAULO GOMES DOS SANTOS - 2323778 - Desenvolvedor
- JONARTA SANTIAGO SOARES - 2327349 - Analista
- Professor adicionado: @ronnison (ronnison.reges@gmail.com)

## 2. Público-alvo
Microempreendedores que precisam emitir contratos com segurança e trilha de auditoria.

## 3. Requisitos Funcionais (mín. 5)
- RF01 Criar contrato (template + variáveis)
- RF02 Assinatura eletrônica com verificação de identidade (2FA/email OTP)
- RF03 Controle de acesso por papéis (Admin/Emissor/Leitor)
- RF04 Histórico e trilha de auditoria (quem fez o quê e quando)
- RF05 Exportar contrato em PDF com hash de integridade
- RF06 (Opcional) Compartilhamento seguro por link temporário

## 4. Requisitos Não Funcionais (Segurança e outros)
- RNF-Sec01 Autenticação forte (MFA/OTP)
- RNF-Sec02 Armazenamento com criptografia em repouso (DB)
- RNF-Sec03 RLS (Row Level Security) isolando dados por usuário/empresa
- RNF-Sec04 Validação server-side e sanitização (anti-SQLi/XSS)
- RNF-Sec05 Logs imutáveis e rate limiting em endpoints sensíveis
- RNF-Perf01 Resposta < 500ms em operações comuns
- RNF-Disp01 Disponibilidade alvo 99,5% (MVP)

## 5. Normas e Compliance
- LGPD (finalidade, consentimento, minimização, retenção)
- Políticas internas: senha forte, reutilização proibida, expiração de sessão

## 6. Análise de Riscos (resumo)
| Risco                    | Vetor       | Impacto | Prob | Tratativa                            |
|-------------------------|-------------|---------|------|--------------------------------------|
| SQL Injection           | Entrada API | Alto    | M    | ORM + queries param., validação      |
| XSS armazenado          | Campos rich | Alto    | M    | Sanitização/escape, CSP              |
| Vazamento de credenciais| Phishing    | Alto    | M    | MFA, aviso de login, IP allowlist    |
| Quebra de autorização   | IDOR        | Alto    | M    | RLS + checagem de owner em backend   |
| Lib vulnerável          | Dependência | Alto    | M    | SCA + atualização automatizada       |

## 7. Modelagem (3+ modelos)
- Diagrama de Arquitetura (cliente → API/Edge → DB com RLS; Auth; Storage)
- Diagrama de Casos de Uso (Emitir contrato, Assinar, Revisar, Exportar)
- Diagrama de Ameaças (STRIDE) com controles (CSP, RLS, rate limit, hashing)

## 8. Implementação Segura
- Guidelines OWASP de codificação segura
- Padrões: DTOs validados, errors genéricos, secrets via env
- RLS no Supabase: políticas por `user_id`/`org_id`

## 9. Testes e Verificação
- TDD para regras críticas (assinatura, autorização, auditoria)
- **SAST**: (ex.) Semgrep/ESLint rules de segurança
- **DAST**: (ex.) ZAP baseline contra a app local
- **SCA**: auditoria de dependências (npm audit)
- Pentest básico de IDOR e fluxo de autenticação

## 10. Como Rodar
- Requisitos: Node 20+, Supabase CLI
- `cp .env.example .env` e ajustar secrets
- `npm i && npm run dev` (frontend)
- `supabase start` (se aplicável)
- Scripts de seed: `npm run seed`

## 11. Deploy (opcional)
- URL da aplicação
- Variáveis de ambiente e chaves rotacionadas

## 12. Licença
MIT (ou conforme necessidade do curso)

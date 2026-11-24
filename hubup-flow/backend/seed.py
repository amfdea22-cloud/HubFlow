"""Script de seed pré-populado para o workspace corporativo HubFlow."""

import argparse
import sys
from pathlib import Path

# Garante importação do pacote `app` ao executar `python seed.py`
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sqlalchemy import select  # noqa: E402

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import Board, BoardColumn, Card, Label, Subtask  # noqa: E402


WORKSPACE_SEED = [
    {
        "name": "Central de Organização da Equipe",
        "prefix_key": "HUB",
        "description": "Hub central da equipe HubUP: apresentação do time, recursos estratégicos, FAQ, prioridades da semana e projetos em andamento.",
        "columns": [
            {"name": "Com Vocês, a Equipe!", "wip_limit": None, "color": "#0EA5E9", "is_done": False},
            {"name": "Recursos", "wip_limit": None, "color": "#8B5CF6", "is_done": False},
            {"name": "Perguntas Frequentes", "wip_limit": None, "color": "#06B6D4", "is_done": False},
            {"name": "Prioridades da Semana", "wip_limit": 5, "color": "#F59E0B", "is_done": False},
            {"name": "Projetos em Progresso", "wip_limit": 4, "color": "#EC4899", "is_done": False},
            {"name": "A Seguir", "wip_limit": None, "color": "#6366F1", "is_done": False},
            {"name": "Concluído", "wip_limit": None, "color": "#10B981", "is_done": True},
        ],
        "labels": [
            ("Equipe", "#0EA5E9"),
            ("Cultura", "#EC4899"),
            ("Guia", "#8B5CF6"),
            ("Estratégia", "#F59E0B"),
            ("Processo", "#06B6D4"),
            ("Entrega", "#10B981"),
        ],
        "cards": [
            # 1. Com Vocês, a Equipe!
            {
                "column": "Com Vocês, a Equipe!",
                "title": "Dica HubUP: Apresente-se para o time!",
                "description": "Crie seu cartão nesta coluna com sua função, produtos em que atua, hobbies fora do trabalho e melhor horário para pair programming.",
                "priority": "baixa",
                "story_points": None,
                "assignee": "People HubUP",
                "labels": ["Cultura", "Guia"],
                "subtasks": [
                    ("Adicionar foto/iniciais e cargo", True),
                    ("Compartilhar 2 curiosidades pessoais", False),
                ],
            },
            {
                "column": "Com Vocês, a Equipe!",
                "title": "André Silva — Tech Lead & Arquitetura IA",
                "description": "Lidera a arquitetura do Anonymize e integrações LLM da HubUP. Fã de café especial, ciclismo e sistemas distribuídos.",
                "priority": "media",
                "story_points": None,
                "assignee": "André Silva",
                "labels": ["Equipe"],
                "subtasks": [],
            },
            {
                "column": "Com Vocês, a Equipe!",
                "title": "Beatriz Rocha — Product Design & Frontend",
                "description": "Responsável pelo Design System HubUP, experiência do usuário e interfaces interativas. Ama tipografia, fotografia e trilhas.",
                "priority": "media",
                "story_points": None,
                "assignee": "Beatriz Rocha",
                "labels": ["Equipe"],
                "subtasks": [],
            },
            {
                "column": "Com Vocês, a Equipe!",
                "title": "Guia de etiquetas e prioridades do HubFlow",
                "description": "Use as etiquetas para categorizar o tipo de demanda e as prioridades (Crítica, Alta, Média, Baixa) para alinhar urgência em todas as squads.",
                "priority": "baixa",
                "story_points": None,
                "assignee": "Marina Costa",
                "labels": ["Guia", "Processo"],
                "subtasks": [],
            },
            # 2. Recursos
            {
                "column": "Recursos",
                "title": "Estratégia e Roadmap 12 Meses — Ecossistema HubUP",
                "description": "Documento vivo com metas trimestrais (OKRs) de Anonymize, Radar FX, Barize, SkyHub e Ads Testing.",
                "priority": "alta",
                "story_points": None,
                "assignee": "Marina Costa",
                "labels": ["Estratégia"],
                "subtasks": [
                    ("OKRs Q1-Q2 revisados com liderança", True),
                    ("Metas de receita e adoção Enterprise", True),
                    ("Revisão semestral com todas as squads", False),
                ],
            },
            {
                "column": "Recursos",
                "title": "Kit de Marca, Logos e Design System HubUP",
                "description": "Paleta oficial (Dark Mode + Azul Neon #00F0FF e Light Mode Clean), tipografia, ícones Lucide e componentes padronizados.",
                "priority": "media",
                "story_points": None,
                "assignee": "Beatriz Rocha",
                "labels": ["Guia"],
                "subtasks": [
                    ("Logos SVG fundo claro e escuro", True),
                    ("Tokens CSS e guia de contraste", True),
                    ("Templates de apresentação comercial", False),
                ],
            },
            {
                "column": "Recursos",
                "title": "Playbook de Onboarding para Novos Integrantes",
                "description": "Checklist completo para a primeira semana na HubUP: acessos, ambiente Docker/Python, rituais e mentoria.",
                "priority": "media",
                "story_points": None,
                "assignee": "People HubUP",
                "labels": ["Processo", "Cultura"],
                "subtasks": [
                    ("Configuração de e-mail, Git e VPN", True),
                    ("Setup local do HubFlow", True),
                    ("Café 1:1 com líderes de produto", False),
                ],
            },
            # 3. Perguntas Frequentes
            {
                "column": "Perguntas Frequentes",
                "title": "Como falar sobre a HubUP para clientes e parceiros?",
                "description": "A HubUP é um ecossistema de software SaaS e Inteligência Artificial focado em produtividade corporativa, conformidade LGPD e automação inteligente.",
                "priority": "baixa",
                "story_points": None,
                "assignee": "Sofia Ribeiro",
                "labels": ["Guia", "Estratégia"],
                "subtasks": [],
            },
            {
                "column": "Perguntas Frequentes",
                "title": "Como nossa equipe se comunica no dia a dia?",
                "description": "Comunicação assíncrona por padrão nos cartões do HubFlow. Daily objetiva de 15 min às 09h30 e Demo geral às sextas-feiras às 16h.",
                "priority": "media",
                "story_points": None,
                "assignee": "Marina Costa",
                "labels": ["Processo"],
                "subtasks": [],
            },
            {
                "column": "Perguntas Frequentes",
                "title": "Onde encontro assets de design, APIs e documentação?",
                "description": "Todos os links de Figma, Swagger (/docs), repositórios Git e runbooks de infraestrutura ficam centralizados na coluna Recursos.",
                "priority": "baixa",
                "story_points": None,
                "assignee": "Felipe Duarte",
                "labels": ["Guia"],
                "subtasks": [],
            },
            # 4. Prioridades da Semana
            {
                "column": "Prioridades da Semana",
                "title": "Sprint Semanal — Alinhamento Geral HubUP",
                "description": "Checklist principal de entregas coordenadas entre produto, engenharia e growth nesta semana.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "Marina Costa",
                "labels": ["Estratégia", "Processo"],
                "subtasks": [
                    ("Revisar alertas de WIP de todos os quadros", True),
                    ("Validar release candidate do Anonymize LGPD", True),
                    ("Aprovar criativos de Ads Testing", False),
                    ("Publicar resumo semanal na sexta-feira", False),
                ],
            },
            {
                "column": "Prioridades da Semana",
                "title": "Revisão de SLA e monitoramento SkyHub",
                "description": "Checar latência p95 e alertas de infraestrutura antes do pico de acessos do mês.",
                "priority": "alta",
                "story_points": 3,
                "assignee": "Felipe Duarte",
                "labels": ["Processo"],
                "subtasks": [
                    ("Auditar logs OpenTelemetry", True),
                    ("Validar backup PostgreSQL 17", False),
                ],
            },
            # 5. Projetos em Progresso
            {
                "column": "Projetos em Progresso",
                "title": "Lançamento Comercial Anonymize Enterprise (LGPD)",
                "description": "Coordenação entre engenharia, jurídico e comercial para os primeiros 10 clientes piloto.",
                "priority": "critica",
                "story_points": 13,
                "assignee": "André Silva",
                "labels": ["Estratégia", "Entrega"],
                "subtasks": [
                    ("Material de demo interativa", True),
                    ("Checklist de segurança e DPO", True),
                    ("Onboarding dos 3 primeiros clientes", False),
                ],
            },
            {
                "column": "Projetos em Progresso",
                "title": "Padronização Visual HubFlow (Claro & Escuro)",
                "description": "Evolução da plataforma interna de gestão ágil com temas personalizáveis, métricas WIP e central da equipe.",
                "priority": "alta",
                "story_points": 8,
                "assignee": "Beatriz Rocha",
                "labels": ["Entrega", "Cultura"],
                "subtasks": [
                    ("Modo Claro e Escuro", True),
                    ("Menu lateral com planos de fundo", True),
                    ("Central de Organização da Equipe", True),
                ],
            },
            # 6. A Seguir
            {
                "column": "A Seguir",
                "title": "Planejamento Trimestral Q2 — Workshop de Squads",
                "description": "Definir prioridades de Radar FX, Barize e novas automações com IA para o próximo ciclo.",
                "priority": "media",
                "story_points": 5,
                "assignee": "Marina Costa",
                "labels": ["Estratégia"],
                "subtasks": [
                    ("Coletar feedbacks dos clientes", False),
                    ("Consolidar capacidade de Story Points", False),
                ],
            },
            {
                "column": "A Seguir",
                "title": "Atualizar materiais de produto e capturas das lojas",
                "description": "Renovar screenshots e vídeos curtos dos produtos HubUP para site e apresentações.",
                "priority": "baixa",
                "story_points": 3,
                "assignee": "Sofia Ribeiro",
                "labels": ["Guia"],
                "subtasks": [],
            },
            # 7. Concluído
            {
                "column": "Concluído",
                "title": "Migração do Workspace Corporativo para HubFlow",
                "description": "Todos os 5 produtos e a Central da Equipe unificados em uma única plataforma com controle de WIP.",
                "priority": "alta",
                "story_points": 8,
                "assignee": "André Silva",
                "labels": ["Entrega", "Cultura"],
                "subtasks": [
                    ("Importação dos quadros de produto", True),
                    ("Treinamento rápido da equipe", True),
                    ("Validação de métricas ágeis", True),
                ],
            },
        ],
    },
    {
        "name": "Anonymize — MVP LGPD",
        "prefix_key": "ANON",
        "description": "Motor de anonimização inteligente de documentos e PII em conformidade com a LGPD.",
        "columns": [
            {"name": "Backlog", "wip_limit": None, "color": "#64748B", "is_done": False},
            {"name": "A Fazer", "wip_limit": 4, "color": "#0EA5E9", "is_done": False},
            {"name": "Em Progresso", "wip_limit": 2, "color": "#00F0FF", "is_done": False},
            {"name": "Code Review / QA", "wip_limit": 2, "color": "#A855F7", "is_done": False},
            {"name": "Concluído", "wip_limit": None, "color": "#10B981", "is_done": True},
        ],
        "labels": [
            ("LGPD", "#00F0FF"),
            ("IA / NER", "#A855F7"),
            ("Backend", "#0EA5E9"),
            ("Frontend", "#38BDF8"),
            ("Segurança", "#EF4444"),
            ("Compliance", "#F59E0B"),
        ],
        "cards": [
            {
                "column": "Backlog",
                "title": "Suporte a anonimização de arquivos DOCX e XLSX em lote",
                "description": "Implementar pipeline assíncrono para extração e mascaramento de dados pessoais em planilhas e documentos Word.",
                "priority": "media",
                "story_points": 8,
                "assignee": "Lucas Mendes",
                "labels": ["Backend", "LGPD"],
                "subtasks": [
                    ("Parser python-docx preservando estilos", False),
                    ("Parser openpyxl com detecção de CPF/CNPJ por coluna", False),
                    ("Fila assíncrona com progresso em tempo real", False),
                ],
            },
            {
                "column": "A Fazer",
                "title": "Relatório de auditoria LGPD exportável em PDF assinado",
                "description": "Gerar certificado de anonimização com hash SHA-256 do documento original e lista de entidades mascaradas.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "Marina Costa",
                "labels": ["Compliance", "LGPD"],
                "subtasks": [
                    ("Template corporativo HubUP em HTML/PDF", True),
                    ("Registro de hash e timestamp UTC", False),
                    ("Endpoint GET /audit/{job_id}/pdf", False),
                ],
            },
            {
                "column": "Em Progresso",
                "title": "Pipeline NER híbrido (Regex + LLM) para detecção de PII",
                "description": "Combinar validadores determinísticos de CPF/RG/e-mail com modelo NER para nomes próprios e endereços em PDFs jurídicos.",
                "priority": "critica",
                "story_points": 13,
                "assignee": "André Silva",
                "labels": ["IA / NER", "LGPD", "Backend"],
                "subtasks": [
                    ("Validadores determinísticos CPF, CNPJ, telefone e e-mail", True),
                    ("Camada NER para nomes, endereços e dados sensíveis", True),
                    ("Benchmark de precisão > 98.5% em 200 contratos reais", False),
                    ("Fallback offline sem envio de PII para APIs externas", False),
                ],
            },
            {
                "column": "Em Progresso",
                "title": "Visualizador lado a lado (Original vs Anonimizado)",
                "description": "Interface interativa para revisão humana destacando cada entidade substituída por token reversível ou tarja preta.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "Beatriz Rocha",
                "labels": ["Frontend", "LGPD"],
                "subtasks": [
                    ("Highlight sincronizado por coordenadas do PDF", True),
                    ("Ação de aprovar ou reverter entidade individual", False),
                ],
            },
            {
                "column": "Em Progresso",
                "title": "Cofre criptografado AES-256-GCM para pseudonimização reversível",
                "description": "Permitir reversão controlada mediante chave KMS e duplo fator de aprovação do DPO.",
                "priority": "critica",
                "story_points": 8,
                "assignee": "Rafael Lima",
                "is_blocked": True,
                "blocked_reason": "Aguardando provisionamento da chave KMS corporativa em produção pelo time de SecOps.",
                "labels": ["Segurança", "Compliance"],
                "subtasks": [
                    ("Envelope encryption com rotação de DEK", True),
                    ("Integração com KMS corporativo", False),
                    ("Log imutável de acessos de reversão", False),
                ],
            },
            {
                "column": "Code Review / QA",
                "title": "Política de retenção zero (auto-purge em 15 minutos)",
                "description": "Garantir exclusão segura de arquivos temporários em disco e memória após download do documento anonimizado.",
                "priority": "alta",
                "story_points": 3,
                "assignee": "Rafael Lima",
                "labels": ["Segurança", "Backend"],
                "subtasks": [
                    ("Job agendado de limpeza a cada 60s", True),
                    ("Teste automatizado validando ausência de resíduos", True),
                ],
            },
            {
                "column": "Concluído",
                "title": "Autenticação SSO Corporativa e RBAC (Admin / DPO / Operador)",
                "description": "Controle de acesso granular por perfil com auditoria de sessão.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "André Silva",
                "labels": ["Segurança", "Backend"],
                "subtasks": [
                    ("Fluxo OAuth2 / OIDC", True),
                    ("Middleware de permissões RBAC", True),
                ],
            },
        ],
    },
    {
        "name": "Radar FX",
        "prefix_key": "RFX",
        "description": "Monitoramento cambial em tempo real, alertas inteligentes de spread e hedge automatizado.",
        "columns": [
            {"name": "Backlog", "wip_limit": None, "color": "#64748B", "is_done": False},
            {"name": "A Fazer", "wip_limit": 4, "color": "#0EA5E9", "is_done": False},
            {"name": "Em Progresso", "wip_limit": 3, "color": "#00F0FF", "is_done": False},
            {"name": "Code Review / QA", "wip_limit": 2, "color": "#A855F7", "is_done": False},
            {"name": "Concluído", "wip_limit": None, "color": "#10B981", "is_done": True},
        ],
        "labels": [
            ("Market Data", "#00F0FF"),
            ("WebSocket", "#0EA5E9"),
            ("Alertas", "#F59E0B"),
            ("Quant / IA", "#A855F7"),
        ],
        "cards": [
            {
                "column": "A Fazer",
                "title": "Simulador de hedge cambial para importadores",
                "description": "Cálculo de exposição USD/BRL e EUR/BRL com cenários de estresse.",
                "priority": "media",
                "story_points": 8,
                "assignee": "Diego Alves",
                "labels": ["Quant / IA"],
                "subtasks": [
                    ("Modelo de volatilidade histórica 30/90d", False),
                    ("Gráfico interativo de sensibilidade", False),
                ],
            },
            {
                "column": "Em Progresso",
                "title": "Stream WebSocket de baixa latência USD/BRL e EUR/BRL",
                "description": "Ingestão contínua de ticks com reconexão automática e circuit breaker.",
                "priority": "critica",
                "story_points": 5,
                "assignee": "Camila Nogueira",
                "labels": ["Market Data", "WebSocket"],
                "subtasks": [
                    ("Conector WebSocket com heartbeat", True),
                    ("Cache Redis com janela deslizante", True),
                    ("Alertas de latência > 250ms", False),
                ],
            },
            {
                "column": "Code Review / QA",
                "title": "Disparo de alertas via WhatsApp e Webhook em rompimento de banda",
                "description": "Notificar tesouraria quando a cotação cruzar gatilhos configurados pelo cliente.",
                "priority": "alta",
                "story_points": 3,
                "assignee": "Diego Alves",
                "labels": ["Alertas"],
                "subtasks": [
                    ("Motor de regras com debounce de 5 min", True),
                    ("Retry exponencial para webhooks", True),
                ],
            },
            {
                "column": "Concluído",
                "title": "Dashboard de cotações PTAX vs Comercial",
                "description": "Comparativo histórico e spread em tempo real.",
                "priority": "media",
                "story_points": 3,
                "assignee": "Camila Nogueira",
                "labels": ["Market Data"],
                "subtasks": [("Integração API Banco Central", True)],
            },
        ],
    },
    {
        "name": "Barize",
        "prefix_key": "BAR",
        "description": "Plataforma SaaS de gestão de bares, comandas digitais, estoque inteligente e PDV.",
        "columns": [
            {"name": "Backlog", "wip_limit": None, "color": "#64748B", "is_done": False},
            {"name": "A Fazer", "wip_limit": 5, "color": "#0EA5E9", "is_done": False},
            {"name": "Em Progresso", "wip_limit": 3, "color": "#00F0FF", "is_done": False},
            {"name": "Code Review / QA", "wip_limit": 2, "color": "#A855F7", "is_done": False},
            {"name": "Concluído", "wip_limit": None, "color": "#10B981", "is_done": True},
        ],
        "labels": [
            ("PDV", "#00F0FF"),
            ("Pagamentos", "#10B981"),
            ("Mobile", "#A855F7"),
            ("Estoque", "#F59E0B"),
        ],
        "cards": [
            {
                "column": "A Fazer",
                "title": "Previsão de ruptura de estoque de bebidas para fins de semana",
                "description": "Sugerir pedido automático com base no histórico de vendas e previsão do tempo.",
                "priority": "media",
                "story_points": 5,
                "assignee": "Thiago Martins",
                "labels": ["Estoque"],
                "subtasks": [("Cálculo de giro médio por SKU", False)],
            },
            {
                "column": "Em Progresso",
                "title": "Fechamento de comanda com divisão de conta via PIX",
                "description": "Permitir dividir itens por pessoa e gerar QR Code PIX dinâmico com baixa automática.",
                "priority": "critica",
                "story_points": 8,
                "assignee": "Juliana Prado",
                "labels": ["PDV", "Pagamentos"],
                "subtasks": [
                    ("UI de divisão por item ou valor igual", True),
                    ("Conciliação via webhook PIX", False),
                ],
            },
            {
                "column": "Concluído",
                "title": "Impressão térmica de pedidos na cozinha e bar (ESC/POS)",
                "description": "Roteamento automático por categoria do cardápio.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "Thiago Martins",
                "labels": ["PDV"],
                "subtasks": [("Driver bridge local Windows/Linux", True)],
            },
        ],
    },
    {
        "name": "SkyHub",
        "prefix_key": "SKY",
        "description": "Hub de integrações, orquestração de microsserviços e telemetria cloud do ecossistema HubUP.",
        "columns": [
            {"name": "Backlog", "wip_limit": None, "color": "#64748B", "is_done": False},
            {"name": "A Fazer", "wip_limit": 4, "color": "#0EA5E9", "is_done": False},
            {"name": "Em Progresso", "wip_limit": 3, "color": "#00F0FF", "is_done": False},
            {"name": "Code Review / QA", "wip_limit": 2, "color": "#A855F7", "is_done": False},
            {"name": "Concluído", "wip_limit": None, "color": "#10B981", "is_done": True},
        ],
        "labels": [
            ("Cloud", "#0EA5E9"),
            ("Observabilidade", "#00F0FF"),
            ("API Gateway", "#A855F7"),
            ("DevOps", "#F59E0B"),
        ],
        "cards": [
            {
                "column": "Em Progresso",
                "title": "Rate limiting adaptativo por tenant no API Gateway",
                "description": "Proteger endpoints críticos com cotas dinâmicas por plano Enterprise/Pro.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "Felipe Duarte",
                "labels": ["API Gateway", "Cloud"],
                "subtasks": [
                    ("Token bucket distribuído em Redis", True),
                    ("Headers X-RateLimit-* padronizados", False),
                ],
            },
            {
                "column": "Code Review / QA",
                "title": "Tracing distribuído OpenTelemetry entre todos os serviços HubUP",
                "description": "Correlacionar requisições ponta a ponta com propagação de traceparent.",
                "priority": "alta",
                "story_points": 8,
                "assignee": "Felipe Duarte",
                "labels": ["Observabilidade", "DevOps"],
                "subtasks": [
                    ("Instrumentação FastAPI e SQLAlchemy", True),
                    ("Dashboard de latência p95/p99", True),
                ],
            },
            {
                "column": "Concluído",
                "title": "Provisionamento IaC do cluster PostgreSQL 17 HA",
                "description": "Backups automatizados PITR e réplica de leitura.",
                "priority": "critica",
                "story_points": 8,
                "assignee": "Rafael Lima",
                "labels": ["Cloud", "DevOps"],
                "subtasks": [("Teste de failover < 30s", True)],
            },
        ],
    },
    {
        "name": "Ads Testing",
        "prefix_key": "ADS",
        "description": "Motor de experimentação A/B de criativos, análise de ROAS e geração de variações com IA.",
        "columns": [
            {"name": "Backlog", "wip_limit": None, "color": "#64748B", "is_done": False},
            {"name": "A Fazer", "wip_limit": 4, "color": "#0EA5E9", "is_done": False},
            {"name": "Em Progresso", "wip_limit": 3, "color": "#00F0FF", "is_done": False},
            {"name": "Code Review / QA", "wip_limit": 2, "color": "#A855F7", "is_done": False},
            {"name": "Concluído", "wip_limit": None, "color": "#10B981", "is_done": True},
        ],
        "labels": [
            ("Growth", "#00F0FF"),
            ("Meta Ads", "#0EA5E9"),
            ("Google Ads", "#F59E0B"),
            ("GenAI", "#A855F7"),
        ],
        "cards": [
            {
                "column": "A Fazer",
                "title": "Conector de métricas horárias Google Ads + Meta Ads",
                "description": "Consolidar CTR, CPA e ROAS em um único painel comparativo por criativo.",
                "priority": "alta",
                "story_points": 5,
                "assignee": "Sofia Ribeiro",
                "labels": ["Meta Ads", "Google Ads"],
                "subtasks": [
                    ("Sincronização incremental via API v21", False),
                    ("Normalização de UTM e atribuição", False),
                ],
            },
            {
                "column": "Em Progresso",
                "title": "Gerador de variações de copy e hooks com significância estatística",
                "description": "Criar 5 variações de anúncio automaticamente e pausar perdedores quando p-value < 0.05.",
                "priority": "alta",
                "story_points": 8,
                "assignee": "Sofia Ribeiro",
                "is_blocked": True,
                "blocked_reason": "Limite de rate da conta sandbox do Meta Marketing API aguardando aprovação.",
                "labels": ["GenAI", "Growth"],
                "subtasks": [
                    ("Prompt estruturado por persona e dor", True),
                    ("Teste Z bilateral automatizado", True),
                    ("Pausa automática de criativos abaixo do threshold", False),
                ],
            },
            {
                "column": "Concluído",
                "title": "Biblioteca de criativos vencedores com busca semântica",
                "description": "Indexar histórico de anúncios campeões por nicho e formato.",
                "priority": "baixa",
                "story_points": 3,
                "assignee": "Beatriz Rocha",
                "labels": ["Growth", "GenAI"],
                "subtasks": [("Embeddings de copy + tags", True)],
            },
        ],
    },
]


def run_seed(reset: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_boards = db.execute(select(Board)).scalars().all()
        if reset and existing_boards:
            print("[seed] --reset ativo: limpando dados existentes...")
            for board in existing_boards:
                db.delete(board)
            db.commit()
            existing_boards = []

        existing_prefixes = {b.prefix_key for b in existing_boards}
        boards_to_create = [b for b in WORKSPACE_SEED if b["prefix_key"] not in existing_prefixes]

        if not boards_to_create:
            print(f"[seed] Banco já possui todos os {len(existing_boards)} quadros. Pulando seed.")
            return

        for board_data in boards_to_create:
            board = Board(
                name=board_data["name"],
                prefix_key=board_data["prefix_key"],
                description=board_data["description"],
                next_card_number=1,
            )
            db.add(board)
            db.flush()

            col_map: dict[str, BoardColumn] = {}
            for idx, col_cfg in enumerate(board_data["columns"]):
                col = BoardColumn(
                    board_id=board.id,
                    name=col_cfg["name"],
                    position=idx,
                    wip_limit=col_cfg["wip_limit"],
                    color=col_cfg["color"],
                    is_done=col_cfg["is_done"],
                )
                db.add(col)
                db.flush()
                col_map[col.name] = col

            label_map: dict[str, Label] = {}
            for label_name, label_color in board_data["labels"]:
                label = Label(board_id=board.id, name=label_name, color=label_color)
                db.add(label)
                db.flush()
                label_map[label_name] = label

            col_positions: dict[int, int] = {c.id: 0 for c in col_map.values()}

            for card_cfg in board_data["cards"]:
                col = col_map[card_cfg["column"]]
                pos = col_positions[col.id]
                col_positions[col.id] += 1

                code = f"{board.prefix_key}-{board.next_card_number}"
                board.next_card_number += 1

                card = Card(
                    board_id=board.id,
                    column_id=col.id,
                    code=code,
                    title=card_cfg["title"],
                    description=card_cfg.get("description"),
                    priority=card_cfg.get("priority", "media"),
                    story_points=card_cfg.get("story_points"),
                    position=pos,
                    assignee=card_cfg.get("assignee"),
                    is_blocked=card_cfg.get("is_blocked", False),
                    blocked_reason=card_cfg.get("blocked_reason"),
                )
                card.labels = [label_map[name] for name in card_cfg.get("labels", []) if name in label_map]
                db.add(card)
                db.flush()

                for st_idx, (st_title, st_done) in enumerate(card_cfg.get("subtasks", [])):
                    db.add(
                        Subtask(
                            card_id=card.id,
                            title=st_title,
                            is_completed=st_done,
                            position=st_idx,
                        )
                    )

        db.commit()
        print(f"[seed] Workspace HubFlow atualizado com sucesso (+{len(boards_to_create)} quadro(s))!")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Popula o banco de dados do HubFlow.")
    parser.add_argument("--reset", action="store_true", help="Apaga dados existentes antes de popular.")
    args = parser.parse_args()
    run_seed(reset=args.reset)

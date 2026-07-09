"""Servicio de orientación profesional — usa el motor de matching determinístico.

Filtra vacantes por las áreas de interés del usuario, muestra las 3 con mayor gap
(los trabajos aspiracionales donde más puede crecer) y calcula roadmap por vacante.
"""

from app.models.user import User
from app.schemas.orientar import (
    OrientarResponse,
    JobMatchDetail,
    CourseRecommendation,
)
from app.services.matching import (
    MOCK_JOBS,
    MOCK_COURSES,
    COURSE_BY_ID,
    SKILL_LABELS,
    SKILLS as S,
    get_user_skills,
    calculate_job_match,
    generate_roadmap,
)

MAX_VACANCIES = 3

JOB_DESCRIPTIONS_PT = {
    "job-fe-01": (
        "Construa a interface da maior plataforma de e-commerce da América Latina. "
        "Você vai projetar interfaces usadas por milhões de pessoas todos os dias, "
        "em uma equipe que prioriza qualidade de código e crescimento profissional."
    ),
    "job-fe-02": (
        "Transforme a experiência digital de empresas Fortune 500 a partir de Buenos Aires. "
        "Você trabalhará com Angular em projetos internacionais onde seu código impacta "
        "milhares de usuários corporativos."
    ),
    "job-fe-03": (
        "Dê forma à transformação digital do varejo líder na América Latina. "
        "Seus dashboards com Vue.js 3 guiarão decisões que impactam milhões de "
        "clientes em toda a região."
    ),
    "job-fe-04": (
        "Junte-se à equipe que define o futuro do desenvolvimento web. "
        "Na Vercel, você construirá componentes Svelte que empurram os limites "
        "da velocidade e da experiência de desenvolvimento."
    ),
    "job-fe-05": (
        "Lidere a migração para Next.js do sistema core de um banco digital. "
        "Um projeto de alto impacto onde cada PR melhora a experiência de "
        "milhões de usuários financeiros."
    ),
    "job-fe-06": (
        "Defina como se vê e se sente a experiência financeira de milhões de argentinos. "
        "Você criará o design system que unifica todos os produtos do Ualá, "
        "do app à web."
    ),
    "job-fe-07": (
        "Faça com que viajar seja possível para todos. Você liderará a iniciativa "
        "de acessibilidade do Despegar, garantindo que cada pessoa — independentemente "
        "de suas capacidades — possa planejar seu próximo destino."
    ),
    "job-fe-08": (
        "Comece sua carreira em tecnologia com o apoio de uma equipe que acredita em você. "
        "Aprenda React, testing e CI/CD com mentoria personalizada de seniors que querem ver você crescer."
    ),
    "job-be-01": (
        "Construa os serviços que processam milhões de pedidos em tempo real. "
        "Seu código em Node.js será o coração do Rappi, conectando restaurantes, "
        "entregadores e clientes em toda a América Latina."
    ),
    "job-be-02": (
        "Dê forma ao futuro dos pagamentos globais. Você trabalhará na equipe de "
        "payments do Eventbrite, integrando gateways de pagamento para que qualquer "
        "pessoa no mundo possa participar de eventos que a inspirem."
    ),
    "job-be-03": (
        "Crie as APIs que sustentam milhares de empreendedores. Na Tiendanube, "
        "você construirá a espinha dorsal da plataforma de e-commerce, com Python "
        "moderno e um stack que prioriza a simplicidade."
    ),
    "job-be-04": (
        "Construa sistemas que movem a economia real. No Santander, você desenvolverá "
        "serviços bancários de missão crítica — cada transação, cada empréstimo, "
        "cada sonho passa pelo seu código."
    ),
    "job-be-05": (
        "Lidere a modernização tecnológica de uma seguradora centenária. "
        "Você migrará sistemas legacy para .NET 8 com microsserviços, transformando "
        "como a empresa atende seus clientes."
    ),
    "job-be-06": (
        "Escreva o código que processa pagamentos para meio continente. "
        "Seus serviços em Go gerenciarão transações financeiras em escala massiva "
        "com a precisão que só uma linguagem como Go pode oferecer."
    ),
    "job-be-07": (
        "Mantenha os sistemas que mantêm a Argentina conectada. Suas aplicações Laravel "
        "gerenciam voos, tripulações e passageiros — o backend silencioso que torna "
        "possível cada decolagem."
    ),
    "job-be-08": (
        "Comece sua jornada em backend com a equipe que formou centenas de developers. "
        "Aprenda Node.js, Express e bancos de dados com mentoria de seniors que lembram "
        "exatamente como é começar."
    ),
    "job-fs-01": (
        "Construa o produto usado por equipes do mundo todo para colaborar visualmente. "
        "Full stack TypeScript de ponta a ponta — React no front, Node.js no back — "
        "em uma das startups mais queridas do ecossistema SaaS."
    ),
    "job-fs-02": (
        "Crie a plataforma que redefine como as equipes visualizam ideias. "
        "Stack híbrido com React e TypeScript no frontend e Python com Django "
        "no backend — o melhor de dois mundos."
    ),
    "job-fs-03": (
        "Conecte milhões de pessoas com o stack que sustenta as telecomunicações "
        "da América Latina. Angular e TypeScript no frontend, Spring Boot e Java "
        "no backend — uma arquitetura sólida onde cada camada importa."
    ),
    "job-fs-04": (
        "Torne-se o primeiro engenheiro de uma startup EdTech que vai mudar como "
        "milhares de estudantes aprendem. Stack MERN do zero — você decide a arquitetura, "
        "você deixa sua marca."
    ),
    "job-fs-05": (
        "Aprenda o stack completo com a equipe que formou os melhores developers "
        "da Argentina. Rotação real entre frontend e backend — em 6 meses você vai "
        "entender como se constrói um produto de ponta a ponta."
    ),
    "job-mo-01": (
        "Dê vida às features que milhões de pessoas usam para pedir comida, "
        "fazer mercado e enviar pacotes. Seu código React Native roda em cada "
        "celular da América Latina."
    ),
    "job-mo-02": (
        "Crie a experiência de compra do futuro. Você liderará a migração do Frávega "
        "para Flutter — um app unificado para iOS e Android que redefine como os "
        "argentinos compram tecnologia."
    ),
    "job-mo-03": (
        "Construa o app que leva comida a milhões de lares. Desenvolvimento nativo "
        "com Swift e SwiftUI em estreita colaboração com design e produto — cada animação, "
        "cada gesto, cada pixel importa."
    ),
    "job-mo-04": (
        "Crie o app que permite a milhões de pessoas gerenciar seu dinheiro pelo celular. "
        "Kotlin, Jetpack Compose e Clean Architecture na equipe mobile do banco mais "
        "inovador da Argentina."
    ),
    "job-do-01": (
        "Projete e opere a infraestrutura que sustenta o maior e-commerce da América Latina. "
        "CI/CD, Kubernetes e monitoramento para centenas de microsserviços — "
        "cada deploy seu impacta milhões."
    ),
    "job-do-02": (
        "Arquitetura cloud a serviço de clientes Fortune 500. Você projetará migrações "
        "para AWS com Terraform, otimizando custos e segurança — a nuvem bem feita "
        "transforma negócios."
    ),
    "job-do-03": (
        "Proteja as economias de milhões de argentinos. Como SRE do Ualá, você garantirá "
        "que a plataforma financeira nunca falhe — SLOs, observabilidade e automação "
        "de incidentes."
    ),
    "job-do-04": (
        "Comece em platform engineering com a equipe que vai te ensinar tudo. "
        "Kubernetes, CI/CD e cloud com seniors que querem compartilhar o que sabem."
    ),
    "job-da-01": (
        "Aplique ciência de dados em escala continental. Você modelará pricing dinâmico "
        "e sistemas de recomendação com terabytes de dados reais — seu trabalho define "
        "o que veem e o que pagam milhões de pessoas."
    ),
    "job-da-02": (
        "Coloque engenharia na inteligência artificial. Você levará modelos de ML "
        "a produção com práticas MLOps de classe mundial — feature stores, monitoramento "
        "e CI/CD para modelos que impactam milhões de entregas."
    ),
    "job-da-03": (
        "Construa os pipelines de dados que alimentam cada decisão da Tiendanube. "
        "Pipelines ETL com Spark e Airflow sobre arquitetura lakehouse — engenharia "
        "de dados a serviço de milhares de empreendedores."
    ),
    "job-da-04": (
        "Coloque a inteligência artificial a serviço do campo. Você integrará LLMs "
        "com RAG para criar assistentes que ajudam produtores agropecuários a tomar "
        "melhores decisões — tecnologia de ponta com impacto real."
    ),
    "job-qa-01": (
        "Garanta que cada release da plataforma bancária seja sólida como uma rocha. "
        "Você automatizará testes E2E com Cypress e Selenium — seu trabalho evita "
        "bugs antes que cheguem à produção."
    ),
    "job-qa-02": (
        "Crie as ferramentas de testing que todos os times de engenharia do Ualá usam. "
        "Contract testing, chaos engineering e frameworks internos para microsserviços."
    ),
    "job-se-01": (
        "Proteja a plataforma de pagamentos mais importante da América Latina. "
        "Segurança ofensiva e defensiva — SAST, DAST e threat modeling para blindar "
        "milhões de transações financeiras."
    ),
    "job-se-02": (
        "Faça com que a segurança seja invisível e onipresente. Você automatizará "
        "escaneamentos de vulnerabilidades e gestão de segredos no pipeline de CI/CD "
        "do Despegar."
    ),
    "job-bc-01": (
        "Escreva o código que protege ativos digitais de milhares de usuários. "
        "Smart contracts em Solidity para a exchange crypto líder da América Latina — "
        "cada linha de código é um compromisso de segurança."
    ),
    "job-bc-02": (
        "Construa a experiência web da wallet crypto mais querida da Argentina. "
        "React, Web3 e wallets on-chain — conectando milhares de usuários com o "
        "mundo cripto de forma simples e segura."
    ),
    "job-gd-01": (
        "Crie os jogos que milhões de pessoas jogam no ônibus, na fila do banco, "
        "em casa. Unity e C# de ponta a ponta — do protótipo ao feature na App Store."
    ),
    "job-gd-02": (
        "Dê seus primeiros passos na indústria de games com o maior estúdio da "
        "América Latina. Aprenda C++ e Unreal Engine com desenvolvedores que "
        "publicaram títulos AAA."
    ),
    "job-pm-01": (
        "Defina o futuro dos produtos usados por milhões de pessoas todos os dias. "
        "Como PM no Mercado Livre, você conectará tecnologia, negócio e experiência "
        "do usuário para criar soluções que transformam o comércio eletrônico na América Latina."
    ),
    "job-pm-02": (
        "Lidere a visão de produto da fintech que está revolucionando a inclusão "
        "financeira na Argentina. Você combinará pensamento estratégico com conhecimento "
        "técnico para priorizar features que impactam a vida financeira de milhões."
    ),
    "job-io-01": (
        "Conecte o mundo físico com o digital. Você desenvolverá soluções IoT para "
        "indústrias como agricultura inteligente, cidades conectadas e manufatura 4.0 — "
        "sensores, edge computing e cloud trabalhando em harmonia."
    ),
    "job-io-02": (
        "Projete o firmware que roda em milhões de dispositivos conectados. "
        "Você trabalhará na interseção de hardware e software — sistemas embarcados, "
        "protocolos IoT e edge computing para a próxima geração de dispositivos inteligentes."
    ),
}


# Map interest_area values (from registration form) → primary matching skill
# Only the primary skill must be present in the job for it to be relevant.
INTEREST_PRIMARY_SKILL: dict[str, str] = {
    "frontend": S["FRONTEND"],
    "backend": S["BACKEND"],
    "fullstack": S["FRONTEND"],  # filtered specially: needs frontend + backend
    "mobile": S["MOBILE"],
    "ai_ml": S["AI"],
    "data_science": S["DATA_SCIENCE"],
    "devops": S["DEVOPS"],
    "cloud": S["CLOUD"],
    "cybersecurity": S["SECURITY"],
    "qa_testing": S["TESTING"],
    "ux_ui": S["UIUX"],
    "product_management": S["PRODUCT_MANAGEMENT"],
    "blockchain": S["BLOCKCHAIN"],
    "iot": S["IOT"],
    "game_development": S["GAME_DEV"],
}


class OrientarService:
    """Servicio de orientación profesional determinístico."""

    def __init__(self, session):
        self.session = session

    def analizar_perfil(
        self,
        user: User,
        perfil: str,
        nivel: str,
        region: str,
        idioma: str,
        lat: float,
        lng: float,
    ) -> OrientarResponse:
        """Analiza el perfil del usuario contra vacantes de sus áreas de interés."""
        profile = get_user_skills(user.known_technologies or [])
        user_skill_set = set(profile.skills)
        interest_areas = user.interest_areas or []

        relevant_jobs = self._filter_jobs_by_interests(interest_areas)

        results = []
        for job in relevant_jobs:
            result = calculate_job_match(user_skill_set, job)
            gap = round(100.0 - result.score, 1)
            if gap >= 10:  # only jobs with meaningful gaps
                results.append((job, result, gap))

        results.sort(key=lambda x: x[2])  # smallest gap first → closest to qualifying
        top = results[:MAX_VACANCIES]

        gap_porcentual = self._avg_gap(top) if top else 0.0
        gap_items = self._collect_gap_items(top)
        trayectoria = self._build_trayectoria(top)
        vacantes = self._build_vacancy_details(top, idioma)
        confianza = self._compute_confianza(user, profile)

        return OrientarResponse(
            gap_porcentual=gap_porcentual,
            gap_items=gap_items,
            trayectoria_sugerida=trayectoria,
            vacantes_compatibles=vacantes,
            confianza=confianza,
        )

    # ── Filtering ─────────────────────────────────────────────────────────

    def _filter_jobs_by_interests(self, interest_areas: list[str]) -> list:
        """Return jobs matching the user's interest areas by primary skill overlap.

        Special case: 'fullstack' matches jobs requiring BOTH frontend AND backend.
        Falls back to all jobs if no interests declared."""
        if not interest_areas:
            return MOCK_JOBS

        primary_skills: set[str] = set()
        has_fullstack = "fullstack" in interest_areas

        for area in interest_areas:
            skill = INTEREST_PRIMARY_SKILL.get(area)
            if skill:
                primary_skills.add(skill)

        if not primary_skills:
            return MOCK_JOBS

        def matches(job) -> bool:
            job_skills = set(job.required_skills) | set(job.optional_skills)
            if primary_skills & job_skills:
                return True
            if has_fullstack and (
                S["FRONTEND"] in job_skills and S["BACKEND"] in job_skills
            ):
                return True
            return False

        return [job for job in MOCK_JOBS if matches(job)]

    # ── Aggregation helpers ───────────────────────────────────────────────

    def _avg_gap(self, top: list) -> float:
        return round(sum(r[2] for r in top) / len(top), 1)

    def _collect_gap_items(self, top: list) -> list[str]:
        from collections import Counter

        counter: Counter = Counter()
        for _job, result, _gap in top:
            for skill in result.missing_required:
                counter[SKILL_LABELS.get(skill, skill)] += 1
        return [label for label, _ in counter.most_common(6)]

    def _build_trayectoria(self, top: list) -> list[str]:
        all_missing: set[str] = set()
        for _job, result, _gap in top:
            all_missing.update(result.missing_required)

        course_ids = generate_roadmap(list(all_missing), MOCK_COURSES)
        return [
            COURSE_BY_ID[cid].title for cid in course_ids if cid in COURSE_BY_ID
        ][:3] or ["Programa ONE de Oracle — Desarrollo de Software"]

    # ── Vacancy details ───────────────────────────────────────────────────

    def _build_vacancy_details(self, top: list, idioma: str) -> list[JobMatchDetail]:
        return [
            self._build_single_vacancy(job, result, gap, idioma)
            for job, result, gap in top
        ]

    def _build_single_vacancy(
        self, job, result, gap: float, idioma: str = "es"
    ) -> JobMatchDetail:
        is_pt = idioma.startswith("pt")
        description = JOB_DESCRIPTIONS_PT.get(job.id, job.description) if is_pt else job.description
        per_skill_courses = generate_roadmap(result.missing_required, MOCK_COURSES)
        recommendations = [
            CourseRecommendation(
                title=COURSE_BY_ID[cid].title,
                provider=COURSE_BY_ID[cid].provider,
                duration=COURSE_BY_ID[cid].duration,
                url=COURSE_BY_ID[cid].url,
            )
            for cid in per_skill_courses
            if cid in COURSE_BY_ID
        ]

        return JobMatchDetail(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            description=description,
            area=job.area,
            seniority=job.seniority,
            salary=job.salary,
            gap_porcentual=gap,
            matched_skills=[SKILL_LABELS.get(s, s) for s in result.matched_required],
            missing_skills=[SKILL_LABELS.get(s, s) for s in result.missing_required],
            required_skills=[SKILL_LABELS.get(s, s) for s in job.required_skills],
            optional_skills=[SKILL_LABELS.get(s, s) for s in job.optional_skills],
            recommended_courses=recommendations,
        )

    # ── Confidence ─────────────────────────────────────────────────────────

    def _compute_confianza(self, user: User, profile) -> float:
        techs = user.known_technologies or []
        if not techs:
            return 0.5
        mapped = len(profile.skills) + len(profile.custom_technologies)
        total = len(techs)
        ratio = mapped / total if total > 0 else 1.0
        if len(profile.skills) >= 5:
            return round(min(ratio + 0.1, 0.95), 2)
        return round(ratio, 2)

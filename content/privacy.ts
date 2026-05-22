import { site } from "@/content/site";

export const privacy = {
  title: "Política de Privacidade",
  lastUpdated: "21 de maio de 2026",
  intro: `Esta Política descreve como são tratados os dados pessoais no site ${site.url} (“Site”), mantido por ${site.professional.name}, neuropsicopedagoga (${site.professional.credential}), em nome de ${site.name} (“controladora”).`,

  sections: [
    {
      title: "1. Para que serve este Site",
      paragraphs: [
        "O Site tem caráter informativo: apresenta os serviços de neuropsicopedagogia (avaliação, acompanhamento e orientação), modalidades de atendimento (online e a domicílio em Porto Alegre e região) e formas de contato.",
        "O Site não substitui avaliação, diagnóstico ou atendimento profissional. A relação com famílias e pacientes começa fora do Site, em conversa direta (por exemplo, pelo WhatsApp), com termos e documentos próprios do atendimento.",
      ],
    },
    {
      title: "2. Quais dados podemos tratar",
      paragraphs: [
        "O Site não possui formulário de cadastro, newsletter nem área logada. Você não precisa informar nome, e-mail ou telefone para apenas navegar.",
        "Se você entrar em contato pelo WhatsApp ou Instagram (links do Site), os dados que enviar nessas plataformas são tratados conforme as regras do WhatsApp/Meta e do Instagram, e na conversa profissional.",
        "Ao acessar o Site, podemos tratar automaticamente dados de navegação (páginas visitadas, data e hora), dados técnicos (navegador, sistema operacional), endereço IP e cookies ou tecnologias similares para métricas. Utilizamos Vercel Analytics para entender o uso do Site e melhorar o conteúdo.",
      ],
    },
    {
      title: "3. Finalidades e base legal (LGPD)",
      paragraphs: [
        "Tratamos dados para: funcionamento e segurança do Site; métricas e melhoria da experiência (Vercel Analytics); responder contatos que você iniciar; e cumprimento de obrigações legais, quando aplicável.",
        "As bases legais incluem legítimo interesse (métricas e segurança), consentimento (quando aplicável a cookies não essenciais), execução de procedimentos preliminares (quando você solicita informações sobre atendimento) e obrigação legal.",
      ],
    },
    {
      title: "4. Cookies e tecnologias similares",
      paragraphs: [
        "O Site pode usar cookies necessários ao funcionamento (hospedagem) e cookies de medição (Vercel Analytics). Você pode limitar cookies nas configurações do navegador; isso pode afetar algumas funcionalidades.",
      ],
    },
    {
      title: "5. Compartilhamento e transferência internacional",
      paragraphs: [
        "Podemos compartilhar dados com prestadores necessários à operação do Site, como a Vercel Inc. (hospedagem e analytics). Ao usar links de WhatsApp ou Instagram, o tratamento ocorre nas plataformas da Meta. Não vendemos seus dados pessoais.",
        "A Vercel pode processar dados em servidores fora do Brasil. Nesses casos, buscamos medidas compatíveis com a LGPD.",
      ],
    },
    {
      title: "6. Prazo de guarda",
      paragraphs: [
        "Dados de analytics e logs são mantidos conforme a política da Vercel e a necessidade de análise. Conversas no WhatsApp ou Instagram, quando houver atendimento, seguem as regras profissionais e do CFEP aplicáveis.",
      ],
    },
    {
      title: "7. Seus direitos",
      paragraphs: [
        "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade (quando aplicável), informação sobre compartilhamentos, revogação de consentimento e oposição, conforme a LGPD.",
        `Para exercer seus direitos, entre em contato pelo WhatsApp ${site.contact.phoneDisplay} ou pelo Instagram do instituto.`,
      ],
    },
    {
      title: "8. Segurança e crianças",
      paragraphs: [
        "Adotamos medidas adequadas ao porte do Site (por exemplo, HTTPS e provedor de confiança). Nenhum sistema é totalmente seguro.",
        "O Site é voltado a responsáveis que buscam informações sobre atendimento para crianças e adolescentes. Não coletamos intencionalmente dados de menores pelo Site.",
      ],
    },
    {
      title: "9. Alterações e autoridade",
      paragraphs: [
        "Podemos atualizar esta Política. A data no topo indica a versão vigente.",
        "Se entender que seus direitos não foram atendidos, você pode contatar a Autoridade Nacional de Proteção de Dados (ANPD): https://www.gov.br/anpd/",
      ],
    },
  ],

  contact: {
    title: "Contato para privacidade",
    items: [
      `WhatsApp: ${site.contact.phoneDisplay}`,
      `Instagram: ${site.contact.instagram}`,
    ],
  },
} as const;

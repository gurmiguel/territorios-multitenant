import { CONTACT_EMAIL, MAIN_APP_TITLE } from '@repo/utils/shared-constants'

import { HeaderConfig } from '~/features/header/context'

const updatedAt = new Date('2025-11-28').toLocaleDateString('pt-BR')

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-2 py-3">
      <HeaderConfig title="Política de Privacidade" backRoute="/territorios" showMap />

      <h1 className="text-3xl mb-4">Política de Privacidade</h1>

      <p>Esta aplicação recolhe alguns dados pessoais dos usuários.</p>

      <hr className="divider" />

      <h4 className="text-xl">Resumo da Política de Privacidade</h4>

      <ul className="flex flex-col gap-2 list-disc ml-5">
        <li>
          <h6>Envio de mensagens</h6>
          <p><strong>Firebase Could Messaging e Firebase Notifications</strong><br/>
            Dados pessoais conforme especificados na política de privacidade do serviço</p>
        </li>
        <li>
          <h6>Dados de autenticação</h6>
          <p>
            <strong>Firebase Authentication</strong><br/>
            Dados pessoais conforme especificados na política de privacidade do serviço
          </p>
        </li>
      </ul>

      <hr className="divider" />

      <p>
        Ao utilizar os serviços desta aplicação, você entende que coletaremos e usaremos suas informações pessoais
        nas formas descritas nesta Política, sob as normas da Constituição Federal de 1988 (art. 5°, LXXIX; e o
        art. 22°, XXX - incluídos pela EC 115/2022), das normas de Proteção de Dados (LGPD, Lei Federal 13.709/2018),
        das disposições consumeristas das Lei Federal 8078/1990 e as demais normas do ordenamento jurídico brasileiro
        aplicáveis.
      </p>

      <h5 className="text-xl mb-2">1. Quais dados coletamos sobre você e para qual finalidade?</h5>

      <p>
        Esta aplicação coleta e utiliza alguns dados pessoais seus, de forma a viabilizar a prestação de serviços e
        aprimorar a experiência de uso.
      </p>

      <h6 className="text-lg">1.1. Dados pessoais fornecidos pelo titular</h6>

      <p>
        • Nome: Utilizado para identificar as ações tomadas pelo usuário dentro da aplicação;<br/>
        • E-mail: Utilizado para identificar as ações tomadas pelo usuário dentro da aplicação e possivelmente enviar
        dados de utilização e autenticação para o mesmo, como exemplo recuperação de acesso;<br/>
      </p>

      <h6 className="text-lg">1.2. Dados pessoais coletados automaticamente</h6>

      <p>
        • Informações do aparelho: utilizadas para apresentar uma visualização adequada e personalizada baseada nas
        configurações disponíveis do dispositivo;<br/>
      </p>

      <h5 className="text-xl mb-2">2. Como coletamos os seus dados?</h5>

      <p>
        Nesse sentido, a coleta dos seus dados pessoais ocorre da seguinte forma:<br/>
        <br/>
        • Por meio de interações manuais efetuadas pelo usuário;<br/>
        • Por meio dos serviços Firebase Cloud Messaging, Firebase Notifications, Firebase Authentication e Firebase Firestore;<br/>
      </p>

      <h6 className="text-lg">2.1. Consentimento</h6>

      <p>
        É a partir do seu consentimento que tratamos os seus dados pessoais. O consentimento é a manifestação livre,
        informada e inequívoca pela qual você autoriza a aplicação <i>{MAIN_APP_TITLE}</i> a tratar seus dados.<br/>
        <br/>
        Assim, em consonância com a Lei Geral de Proteção de Dados, seus dados só serão coletados, tratados e armazenados
        mediante prévio e expresso consentimento. <br/>
        <br/>
        O seu consentimento será obtido de forma específica para cada finalidade acima descrita, evidenciando o
        compromisso de transparência e boa-fé da (nome empresarial simplificado) para com seus usuários/clientes,
        seguindo as regulações legislativas pertinentes.<br/>
        <br/>
        Ao utilizar os serviços da aplicação <i>{MAIN_APP_TITLE}</i> e fornecer seus dados pessoais, você está ciente
        e consentindo com as disposições desta Política de Privacidade, além de conhecer seus direitos e como exercê-los.<br/>
        <br/>
        A qualquer tempo e sem nenhum custo, você poderá revogar seu consentimento.<br/>
        <br/>
        É importante destacar que a revogação do consentimento para o tratamento dos dados pode implicar a impossibilidade
        da performance adequada de alguma funcionalidade do site que dependa da operação. Tais consequências serão
        informadas previamente.<br/>
      </p>

      <h5 className="text-xl mb-2">3. Quais são os seus direitos?</h5>

      <p>
        A aplicação <i>{MAIN_APP_TITLE}</i> assegura a seus usuários/clientes seus direitos de titular previstos no artigo 18 da Lei Geral de Proteção de Dados. Dessa forma, você pode, de maneira gratuita e a qualquer tempo:<br/>
        <br/>
        • <strong>Confirmar a existência de tratamento de dados</strong>, de maneira simplificada ou em formato claro e completo.<br/>
        • <strong>Acessar seus dados</strong>, podendo solicitá-los em uma cópia legível sob forma impressa ou por meio eletrônico, seguro e idôneo.<br/>
        • <strong>Corrigir seus dados</strong>, ao solicitar a edição, correção ou atualização destes.<br/>
        • <strong>Limitar seus dados quando desnecessários</strong>, excessivos ou tratados em desconformidade com a legislação através da anonimização, bloqueio ou eliminação.<br/>
        • <strong>Solicitar a portabilidade de seus dados</strong>, através de um relatório de dados cadastrais que a (nome empresarial simplificado) trata a seu respeito.<br/>
        • <strong>Eliminar seus dados tratados a partir de seu consentimento</strong>, exceto nos casos previstos em lei.<br/>
        • <strong>Revogar seu consentimento</strong>, desautorizando o tratamento de seus dados.<br/>
        • <strong>Informar-se sobre a possibilidade de não fornecer seu consentimento</strong> e sobre as consequências da negativa.<br/>
        <br/>
        Para exercer seus direitos de titular, você deve entrar em contato com a (nome empresarial simplificado) através dos seguintes meios disponíveis:<br/>
        • Encaminhe um e-mail para: <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a><br/>
        <br/>
        De forma a garantir a sua correta identificação como titular dos dados pessoais objeto da solicitação, é possível que solicitemos documentos ou demais comprovações que possam comprovar sua identidade. Nessa hipótese, você será informado previamente.<br/>
        <br/>
      </p>

      <h5 className="text-xl mb-2">4. Como e por quanto tempo seus dados serão armazenados?</h5>

      <p>
        Seus dados pessoais coletados pela (nome empresarial simplificado) serão utilizados e armazenados durante o tempo
        necessário para a prestação do serviço ou para que as finalidades elencadas na presente Política de Privacidade
        sejam atingidas, considerando os direitos dos titulares dos dados e dos controladores.<br/>
        <br/>
        De modo geral, seus dados serão mantidos enquanto a relação contratual entre você e a (nome empresarial simplificado)
        perdurar. Findado o período de armazenamento dos dados pessoais, estes serão excluídos de nossas bases de dados ou
        anonimizados, ressalvadas as hipóteses legalmente previstas no artigo 16 lei geral de proteção de dados, a saber:<br/>
        <br/>
        I – cumprimento de obrigação legal ou regulatória pelo controlador;<br/>
        <br/>
        II – transferência a terceiro, desde que respeitados os requisitos de tratamento de dados dispostos nesta Lei; ou<br/>
        <br/>
        III – uso exclusivo do controlador, vedado seu acesso por terceiro, e desde que anonimizados os dados.<br/>
        <br/>
        Isto é, informações pessoais sobre você que sejam imprescindíveis para o cumprimento de determinações legais,
        judiciais e administrativas e/ou para o exercício do direito de defesa em processos judiciais e administrativos
        serão mantidas, a despeito da exclusão dos demais dados. <br/>
        <br/>
        O armazenamento de dados coletados pela (nome empresarial simplificado) reflete o nosso compromisso com a segurança
        e privacidade dos seus dados. Empregamos medidas e soluções técnicas de proteção aptas a garantir a confidencialidade,
        integridade e inviolabilidade dos seus dados. Além disso, também contamos com medidas de segurança apropriadas aos
        riscos e com controle de acesso às informações armazenadas.<br/>
        <br/>
      </p>

      <h5 className="text-lx mb-2">5. Cookies ou dados de navegação</h5>

      <p>
        A aplicação <i>{MAIN_APP_TITLE}</i> faz uso de Cookies, que são arquivos de texto enviados pela plataforma ao seu
        dispositivo e que nele se armazenam, que contém informações relacionadas à navegação do site. Em suma, os Cookies
        são utilizados para aprimorar a experiência de uso.<br/>
        <br/>
        Ao acessar nosso site e consentir com o uso de Cookies, você manifesta conhecer e aceitar a utilização de um sistema
        de coleta de dados de navegação com o uso de Cookies em seu dispositivo.<br/>
        A aplicaçãp <i>{MAIN_APP_TITLE}</i> utiliza os seguintes Cookies:<br/>
        <br/>
        • Cookies de autenticação: utilizados para autenticar a utilização do usuário na aplicação e personalizar sua utilização;<br/>
        Você pode, a qualquer tempo e sem nenhum custo, alterar as permissões, bloquear ou recusar os Cookies. Todavia, a
        revogação do consentimento de determinados Cookies pode inviabilizar o funcionamento correto de alguns recursos
        da plataforma.<br/>
        Para gerenciar os cookies do seu navegador, basta fazê-lo diretamente nas configurações do navegador, na área de gestão de
        Cookies.<br/>
        <br/>
      </p>

      <h5 className="text-xl mb-2">6. Alteração desta Política de Privacidade</h5>

      <p>
        A atual versão da Política de Privacidade foi formulada e atualizada pela última vez em: <strong>{updatedAt}</strong>.<br/>
        <br/>
        Reservamos o direito de modificar essa Política de Privacidade a qualquer tempo, principalmente em função da adequação
        a eventuais alterações feitas em nosso site ou em âmbito legislativo. Recomendamos que você a revise com frequência.<br/>
        <br/>
        Eventuais alterações entrarão em vigor a partir de sua publicação em nosso site e sempre lhe notificaremos acerca das
        mudanças ocorridas.<br/>
        <br/>
        Ao utilizar nossos serviços e fornecer seus dados pessoais após tais modificações, você as consente. <br/>
      </p>
    </div>
  )
}

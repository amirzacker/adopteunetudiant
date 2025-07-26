import React from "react";
import "./about-us.css";
function AboutUs() {
  return (
    <div>
      <div className="wrapper">
        <h1>Notre vision</h1>
        <div className="team">
          <div>
            <p>
              Notre vision est de créer un réseau solide et bienveillant
              d'étudiants, de parrains et de marraines, qui s'entraident et
              s'épanouissent ensemble. Nous croyons fermement que la réussite
              professionnelle repose sur le partage d'expériences et la mise en
              commun de compétences. C'est pourquoi nous œuvrons chaque jour
              pour connecter les étudiants aux professionnels, afin de les aider
              à réaliser leurs rêves et à construire leur avenir. Nous vous
              invitons à rejoindre notre communauté et à participer à cette
              aventure humaine unique. Ensemble, construisons un monde où chaque
              étudiant a l'opportunité de réussir et de s'épanouir.
            </p>
          </div>
        </div>
      </div>

      <div className="containerabout">
        <div className="about">
          <div className="left">
            <h1>A Propos de Nous</h1>
            <hr />
            <p>
              Adopte un Étudiant est un projet innovant créé par une équipe
              d'étudiants passionnés et engagés, ayant pour objectif de
              faciliter les rencontres entre étudiants et parrains/marraines
              issus du monde professionnel. Notre mission est de créer des liens
              durables et de qualité, permettant aux étudiants de bénéficier de
              conseils, d'un soutien et d'un réseau pour les aider à réussir
              leurs études et à se lancer dans la vie active.
            </p>
            <p>
              Adopte un Étudiant est composé d'une équipe pluridisciplinaire et
              passionnée, travaillant ensemble pour offrir un service de qualité
              et une expérience utilisateur optimale. Chacun de nous apporte ses
              compétences spécifiques, que ce soit en développement web, en
              marketing, en communication ou en gestion de projet. Notre
              diversité est notre force et nous permet de créer une plateforme
              adaptée aux besoins de tous les étudiants.
            </p>
          </div>
          <div className="right">
            <img src="/assets/img/home1.png" alt="Étudiants collaborant sur un projet" />
          </div>
          <div className="clear"></div>
        </div>

        <div className="mission">
          <div className="left">
            <img src="/assets/img/home5.png" alt="Équipe de professionnels en réunion" />
          </div>
          <div className="right">
            <h1>Notre Histoire</h1>
            <hr />
            <p>
              L'idée d'Adopte un Étudiant est née de notre expérience
              personnelle en tant qu'étudiants, face aux défis rencontrés pour
              construire notre avenir professionnel. Nous avons rapidement
              réalisé que de nombreux étudiants, comme nous, auraient grandement
              bénéficié d'un accompagnement personnalisé pour les guider dans
              leurs choix académiques et professionnels.
            </p>

            <p>
              C'est ainsi que nous avons décidé de créer Adopte un Étudiant, un
              projet qui met en relation des étudiants avec des parrains et
              marraines expérimentés et bienveillants, prêts à partager leurs
              connaissances, leurs compétences et leur réseau professionnel.
            </p>
          </div>
          <div className="clear"></div>
        </div>
      </div>

      <div className="wrapper">
        <h1>Notre équipe</h1>
        <div className="team">
          <div className="team_member">
            <div className="team_img"></div>
            <h3>Alice</h3>
            <p className="role">Co-fondatrice et Directrice Générale</p>
            <p>
              Alice est diplômée d'une école de commerce et possède une solide
              expérience en gestion de projets et en marketing. Elle supervise
              la stratégie globale de la plateforme et coordonne les équipes
              pour offrir la meilleure expérience utilisateur possible.
            </p>
          </div>
          <div className="team_member">
            <div className="team_img"></div>
            <h3>Amir</h3>
            <p className="role">Co-fondateur et Directeur Technique</p>
            <p>
              Amir est diplômé d'une école d'ingénieurs et possède une expertise
              approfondie en développement web et architecture logicielle. Il
              supervise le développement technique de la plateforme et assure
              sa sécurité et sa performance.
            </p>
          </div>
          <div className="team_member">
            <div className="team_img"></div>
            <h3>Sarah</h3>
            <p className="role">Responsable Communication et Relations Publiques</p>
            <p>
              Sarah est titulaire d'un master en communication et possède une
              solide expérience en relations publiques et stratégie de contenu.
              Elle développe la visibilité de la plateforme et maintient les
              relations avec les partenaires et la communauté.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;

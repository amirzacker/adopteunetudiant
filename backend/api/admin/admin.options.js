const { default: AdminBro } = require('admin-bro');
const AdminBroMongoose = require('admin-bro-mongoose');
const conversationsSchema = require("../conversations/conversations.schema");
const domainsSchema = require("../domains/domains.schema");
const messagesSchema = require("../messages/messages.schema");
const searchTypesSchema = require("../searchTypes/searchTypes.schema");
const usersModel = require("../users/users.model");
const contractSchema = require("../contracts/contracts.model");
const adoptionSchema = require("../adoptions/adoptions.model");

AdminBro.registerAdapter(AdminBroMongoose);

/** @type {import('admin-bro').AdminBroOptions} */
const options = {
  resources: [
    {
      resource: usersModel,
      options: {
        navigation: {
          name: 'Users',
          icon: 'User',
        },
      },
    },
    {
      resource: searchTypesSchema,
      options: {
        navigation: {
          name: 'SearchType',
          icon: 'List',
        },
      },
    },
    {
      resource: contractSchema,
      options: {
        navigation: {
          name: 'Contract',
          icon: 'List',
        },
      },
    },
    {
      resource: adoptionSchema,
      options: {
        navigation: {
          name: 'Adoption',
          icon: 'List',
        },
      },
    },
    {
      resource: messagesSchema,
      options: {
        navigation: {
          name: 'Messenger',
          icon: 'Send',
        },
      },
    },
    {
      resource: conversationsSchema,
      options: {
        parent: {
          name: 'Messenger',
          icon: 'Send',
        },
      },
    },
      {
      resource: domainsSchema,
      options: {
        navigation: {
          name: 'Domain',
          icon: 'List',
        },
      },
    },
  ],
  branding: {
    logo: 'https://zupimages.net/up/22/52/ckbw.png',
    companyName: 'Adopte1etudiant',
  },
};

module.exports = options;

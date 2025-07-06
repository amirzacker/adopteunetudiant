const faker = require("faker");
const User = require("../users/users.model");
const searchTypeController = require("../searchTypes/searchTypes.controller");
const domainsController = require("../domains/domains.controller");

const generateFakeUsers = async () => {

// Get all search types and domains from the database
const allSearchTypes = await searchTypeController.getAll();

const allDomains = await domainsController.getAll();

const allcv = ["1672239410567cv1.pdf", "1672239410567cv2.pdf", "1672239410567cv3.pdf"];
const allmotivation = ["1672237679477m1.pdf", "1672237679477m2.pdf", "1672237679477m3.pdf"];
const allprofilpicture = ["pic1.jpg", "pic2.jpg", "pic3.jpg", "pic4.jpg", "pic5.jpg" , "pic6.jpg", "pic7.jpg"];

const debut = new Date(1990, 1, 1);
const fin = new Date(2000, 11, 31);

// Create fake users
for (let i = 0; i < 50; i++) {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();
  const date = faker.date.between(debut, fin);
  const password = "amircentre";
  const profilePicture = faker.random.arrayElement(allprofilpicture);
  const cv = faker.random.arrayElement(allcv);
  const motivationLetter = faker.random.arrayElement(allmotivation);
  const searchType = faker.random.arrayElement(allSearchTypes)._id;
  const domain = faker.random.arrayElement(allDomains)._id;
  const startDate = faker.date.future();
  const endDate = faker.date.future();
  const isStudent = true;
  const desc = faker.company.catchPhrase();
  const city = faker.address.city();
  const status = true;

  const newUser = new User({
    firstname: firstName,
    lastname: lastName,
    email: email,
    password: password,
    profilePicture: profilePicture,
    cv: cv,
    motivationLetter: motivationLetter,
    searchType: searchType,
    domain: domain,
    startDate: startDate,
    endDate: endDate,
    isStudent: isStudent,
    desc: desc,
    date: date,
    status: status,
    city: city,
  });

  await newUser.save();
}

console.log("Fake users generated!");
}


generateFakeUsers()
.then(() => {
console.log('Fake users generated!');
})
.catch((error) => {
console.error(error);
});
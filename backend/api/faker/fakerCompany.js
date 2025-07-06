const faker = require("faker");
const User = require("../users/users.model");


const allprofilpicture = ["logo1.webp", "logo2.webp", "logo4.webp", "logo5.webp", "logo6.webp", "logo8.jpg", "logo8.png", "logo9.jpg"];

// Create fake users
for (let i = 0; i < 50; i++) {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const profilePicture = faker.random.arrayElement(allprofilpicture);
  const isCompany = true;
  const name = faker.company.companyName();
  const desc = faker.company.catchPhrase();
  const city = faker.address.city();

  const newUser = new User({
    email: email,
    password: password,
    profilePicture: profilePicture,
    isCompany: isCompany,
    name: name,
    desc: desc,
    city: city,
  });

  await newUser.save();
}

console.log("Fake users generated!");

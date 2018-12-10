function User(user_id, first_name, last_name, email, add_1, add_2, city, state, post_code, country, password) {
    this.user_id = user_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.add_1 = add_1;
    this.add_2 = add_2;
    this.city = city;
    this.state = state;
    this.post_code = post_code;
    this.country = country;
    this.password = password;
};

module.exports = User;
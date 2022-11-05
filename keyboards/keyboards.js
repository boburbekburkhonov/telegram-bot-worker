import { read } from "../utils/fs.js";
import keyboardText from "./keyboard-text.js";

const allCourses = read('courses.json');

let courses = []

for(let i = 0; i < allCourses.length; i+=2) {
  let arr = []
  arr.push(allCourses[i].name, allCourses[i+1] ? allCourses[i+1].name : null)
  courses.push(arr.filter(e => e))
}

courses.push([keyboardText.menu])

export default {
  menu: [
    [keyboardText.ourCourses, keyboardText.aboutUs],
    [keyboardText.address]
  ],
  courses
}
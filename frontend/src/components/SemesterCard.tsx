import { useState } from "react";
import "./SemesterCard.css";

type Course = {
  code: string;
  title: string;
  credits: number;
  type: string;
};

type SemesterCardProps = {
  title: string;
  courses: Course[];
};

function SemesterCard({ title, courses }: SemesterCardProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const totalCredits = courses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "Major Core":
        return "major";

      case "Gen Ed":
        return "gened";

      case "Math":
        return "math";

      case "Elective":
        return "elective";

      default:
        return "";
    }
  };

  return (
    <div className="semester-card">
      <div className="semester-header">{title}</div>

      <div className="semester-body">
        {courses.map((course, index) => (
          <div
            key={index}
            className={`course-row ${
              index % 2 === 0 ? "light-row" : "dark-row"
            }`}
            onClick={() =>
              setSelectedCourse(
                selectedCourse === course ? null : course
              )
            }
          >
            <div className="course-info">
              <div className="course-code">{course.code}</div>
              <div className="course-title">{course.title}</div>
            </div>

            <div className="course-right">
              <span
                className={`course-type ${getBadgeClass(course.type)}`}
              >
                {course.type}
              </span>

              <span className="course-credits">
                {course.credits}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="semester-footer">
        <span>Total Credits</span>
        <span>{totalCredits}</span>
      </div>

      {selectedCourse && (
        <div className="course-popup">
          <h3>{selectedCourse.code}</h3>

          <p>
            <strong>Course:</strong> {selectedCourse.title}
          </p>

          <p>
            <strong>Credits:</strong> {selectedCourse.credits}
          </p>

          <p>
            <strong>Category:</strong> {selectedCourse.type}
          </p>

          <button
            className="close-popup"
            onClick={() => setSelectedCourse(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default SemesterCard;
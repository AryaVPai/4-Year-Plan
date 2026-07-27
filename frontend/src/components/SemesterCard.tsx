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
  const totalCredits = courses.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  return (
    <div className="semester-card">

      <div className="semester-header">
        {title}
      </div>

      <div className="semester-body">

        {courses.map((course, index) => (
          <div
            className={`course-row ${
              index % 2 === 0 ? "light-row" : "dark-row"
            }`}
            key={index}
          >

            <div className="course-info">

              <div className="course-code">
                {course.code}
              </div>

              <div className="course-title">
                {course.title}
              </div>

            </div>

            <div className="course-right">

              <span className="course-type">
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

    </div>
  );
}

export default SemesterCard;
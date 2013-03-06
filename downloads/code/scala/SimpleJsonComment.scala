import java.util.SimpleDateFormat

trait JsonComment[T] {
  def fromJson: T
}

class JsonComment(comment: String, user: String, time: String)
  extends FromJson[Comment] {

  lazy val dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss")

  def fromJson = Comment(
    comment,
    user,
    dateFormat.parse(time))
}
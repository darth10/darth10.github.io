import java.util.{ DateFormat, SimpleDateFormat }

trait FromJson {
  type C
  type F <: DateFormat	// upper type bound specified

  val formatter: F

  def parseTime(date: String) = formatter.parse(date)

  def fromJson: C 
}

abstract class AbstractJsonComment extends FromJson { 
  type T = Comment
}

abstract class AbstractFormattedJsonComment extends AbstractJsonComment {
  type F = SimpleDateFormat
}

class JsonComment(comment: String, user: String, time: String) 
  extends AbstractFormattedJsonComment {

  val formatter = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss")

  def fromJson = Comment(
    comment,
    user,
    parseTime(time))
}

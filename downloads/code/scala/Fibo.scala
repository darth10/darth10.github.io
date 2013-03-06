object Fibo {
  lazy val fibo: Stream[BigInt] =
    BigInt(0) #::
    BigInt(1) #::
    fibo.zip(fibo.tail).map { n => n._1 + n._2 }

  def fiboList = fibo.take(_: Int).toList

  def fiboLast = fiboList(_: Int).last
}

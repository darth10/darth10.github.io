object List {

  // ...

  def apply[A](xs: A*): List[A] = xs.toList
}

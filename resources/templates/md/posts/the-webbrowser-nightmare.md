{:title "The WebBrowser nightmare"
 :date "2012-09-23"
 :layout :post
 :tags ["programming" "C#"]}

I recently had to use the `WebBrowser` .NET component in a project.
The control is essentially Internet Explorer embedded in a `UserControl` component.
Although the facilities for JavaScript interoperability and DOM manipualtion are pretty great, the control fails to meet simpler needs.

To override keyboard input handing in the control, we need to set the `WebBrowserShortcutsEnabled` property to `false` and handle the `PreviewKeyDown` event.

<!--more-->

```csharp
public class MyControl : UserControl
{
	WebBrowser _webBrowser;

	// ...

	public MyControl()
	{

		// ...

		_webBrowser.WebBrowserShortcutsEnabled = false;
		_webBrowser.PreviewKeyDown +=
			new PreviewKeyDownEventHandler(OnBrowserKeyInput);
	}

	private void OnBrowserKeyInput(object sender, PreviewKeyDownEventArgs e)
	{
		if (e.KeyCode == Keys.W &&
		    e.Modifiers == Keys.Control)
		{
			Debug.WriteLine("C-w pressed");
		}
	}
}
```

Surprisingly, the `OnBrowserKeyInput` method is called twice; once when the key is pressed and another time when the key is released.
After some googling around, I found [this discussion](http://social.msdn.microsoft.com/Forums/en-US/csharpgeneral/thread/f83d3d71-ea3e-4b18-a610-30a91fae060e/) on MSDN, and it turns out to be an accepted problem with the control. The workaround requires explicity maintaining state and is quite ugly.

```csharp
bool _skipNextKeyDown = false;

private void OnBrowserKeyInput(object sender, PreviewKeyDownEventArgs e)
{
	if (_skipNextKeyDown)
	{
		_skipNextKeyDown = false;
		return;
	}

	if (e.KeyCode == Keys.W &&
	    e.Modifiers == Keys.Control)
	{
		Debug.WriteLine("C-w pressed");
		_skipNextKeyDown = true;
	}
}
```

And the nightmare only begins there. The control doesn't fire the event twice for some key combinations, and so the function ends up looking something like this.

```csharp
bool _skipNextKeyDown = false;

private void OnBrowserKeyInput(object sender, PreviewKeyDownEventArgs e)
{
	if (e.KeyCode == Keys.W &&
	    e.Modifiers == (Keys.Control | Keys.Alt))
	{
		Debug.WriteLine("C-M-w pressed");
		return;
	}

	if (_skipNextKeyDown)
	{
		_skipNextKeyDown = false;
		return;
	}

	if (e.KeyCode == Keys.W &&
	    e.Modifiers == Keys.Control)
	{
		Debug.WriteLine("C-w pressed");
		_skipNextKeyDown = true;
	}
}
```

The thing that bothered me most was that this was an accepted bug in the control. Even in the .NET 4.0 version.
The only way to figure out which keys made the event fire twice was by trial-and-error.
It's almost like Microsoft was telling me not to use my own keyboard handling for the control, which sucked.
The end result is some ugly and error prone code.

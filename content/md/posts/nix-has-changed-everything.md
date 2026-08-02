{:title "Nix has changed everything"
 :date "2026-08-01"
 :layout :post
 :description "What I learnt managing my system environment declaratively with Nix, home-manager, and flakes."}

I've carried the same [dotfiles][dotfiles] around for years, copying them from
machine to machine, patching over the differences by hand, and never quite
trusting that a fresh setup would end up like the last one. I used my dotfiles
to configure my Linux machines at home as well as my MacBook, which I generally
use for work. Every time I set up a new machine, I ended up tweaking the scripts
to fix a broken package or a moved config path.

I also preferred using a Linux distribution with a rolling release, so that I
could try out the latest versions of the tools I use. I moved from Ubuntu to
Manjaro ages ago for this reason, but my dotfiles often broke in the most
unexpected ways.

So I decided to run an experiment: rebuild my entire environment declaratively
with [Nix][nix] and try out [NixOS][nixos], and see how far the reproducibility
actually goes. The result is [nix-dotfiles][nix-dotfiles].

<!--more-->

## Why

The pitch for Nix is seductive if you've ever fought with a machine that drifted
away from its config. Instead of a pile of imperative shell scripts that install
packages and create symlinks, you describe the environment you want, and Nix
builds it. The same description produces the same environment, whether it's the
first time or the hundredth, and whether it's my laptop or a machine I'm
deploying to over SSH.

I wanted this to hold across everything I use, not just one operating system. My
laptops run either macOS or Linux, but I also have headless Raspberry Pis and a
[CM3588][cm3588] NAS server. I run Armbian on my Raspberry Pis, and Debian on
the CM3588. That ruled out anything specific to NixOS or macOS as the primary
abstraction, and pointed me at [home-manager][home-manager] for the user-level
environment, with [NixOS][nixos] doing the system-level work where it applies.

## How

The repository is a [flake][flakes], which declares a pinned, reproducible set
of inputs. Its `flake.lock` is the single source of truth for every version in
play. I started out with one enormous `flake.nix`, but later learnt the
_[dendritic][dendritic]_ way of doing things with [`flake-parts`][flake-parts].

The actual dotfiles are the interesting part. Most of my day-to-day tools are
described as small, focused modules: [Doom Emacs][doom], [kitty][kitty], zsh
with [starship][starship], git, GnuPG, and the rest. Each one is a few lines of
Nix that sets up the tool and its configuration, so there's no separate
"install" and "configure" step to keep in sync. Here's the kitty
module in its entirety:

```nix
{self, ...}: {
  flake.modules.homeManager.kitty = {
    pkgs,
    config,
    ...
  }: let
    homeModulesDir = (self.settings.getDirs pkgs).homeModules;
  in {
    home = {
      file."${config.xdg.configHome}/kitty".source =
        config.lib.file.mkOutOfStoreSymlink "${homeModulesDir}/kitty";

      shellAliases.icat = "kitty icat";
    };
  };
}
```

`getDirs` is a small helper in my flake that resolves paths to the repo
checkout. The `mkOutOfStoreSymlink` call is a trick I use for configs I tweak
often: the symlink points back into the repo, so changes take effect without a
Nix build and can be committed later.

On NixOS the path is obvious: it's the system configuration. On my MacBook or
any other non-NixOS box, I install Nix with the [Determinate installer][determinate]
and run home-manager standalone, which manages the user environment without
needing NixOS underneath. Cloning the repo and running a tiny wrapper script
that invokes `nix` is enough to reproduce the whole setup.

For other machines I use [`deploy-rs`][deploy-rs], which builds a configuration
and pushes it over SSH. I found this ideal for Raspberry Pis since running Nix
builds on them takes forever. There's a little plumbing to make `nix-store`
reachable over SSH and to mark the right trusted users, but once that's in
place, updating a remote host is a single command.

Interestingly enough, I managed to get NixOS with a [T2 Linux][t2-linux] kernel
running on an old 2019 MacBook Air around the same time as I learnt about
`flake-parts`. Adding a separate host with mostly the same system configuration
as my other Linux laptop was a breeze.

It's worth adding that Nix is also a great per-project package manager, so I
started using it to create reproducible environments for my personal projects.
In fact, the development environment for this blog site is [defined as a Nix flake][blog-nix-flake].

## What I learnt

The reproducibility is real, and it's the thing that keeps me in Nix despite the
rough edges. Rebuilding a machine is no longer an anxious afternoon of "did I
remember everything?" - it's a single command that takes a few minutes to run,
and the answer is always yes.

I ended up tracking `nixpkgs-unstable` on my machines running NixOS as a
rolling-release distribution. Thanks to rollbacks, which are built into NixOS,
package updates breaking my setup are a thing of the past. Even without a full
system configuration rollback, you can always run the previous working version
of a package - it's right there in the Nix store, at least until you run GC over
it.

The cost is the learning curve, and it's steep. The Nix language is small and
quirky, with documentation scattered across the manual, the wiki, and a lot of
forum posts. Error messages can be inscrutable when you're starting out. I
initially had to spend hours understanding _why_ something worked before I could
get anything done. Using `flake-parts` was amazing once it clicked, but it's
another layer of abstraction to learn on top of Nix itself.

The other honest caveat is that a declarative setup is only as good as your
discipline. The moment you `brew install` something "just for now", you've broken
the promise. Nix doesn't stop you from going around it; it only rewards you for
not.

Would I recommend it? Not if you want quick results - Nix will happily eat a
weekend before it gives you anything back. But if you own more than one machine
and you're the kind of person who has strong opinions about your environment,
the upfront investment pays off. The experiment succeeded on its own terms: one
description, many machines, and a setup I can finally reproduce without thinking
about it.

[dotfiles]: https://github.com/darth10/dotfiles
[nix]: https://wiki.nixos.org/wiki/Nix_package_manager
[nixos]: https://nixos.org/
[nix-dotfiles]: https://github.com/darth10/nix-dotfiles
[cm3588]: https://wiki.friendlyelec.com/wiki/index.php/CM3588
[home-manager]: https://github.com/nix-community/home-manager
[flakes]: https://wiki.nixos.org/wiki/Flakes
[flake-parts]: https://github.com/hercules-ci/flake-parts
[dendritic]: https://github.com/mightyiam/dendritic
[deploy-rs]: https://github.com/serokell/deploy-rs
[t2-linux]: https://wiki.t2linux.org/
[blog-nix-flake]: https://github.com/darth10/darth10.github.io/blob/cryogen/flake.nix
[doom]: https://github.com/doomemacs/doomemacs
[kitty]: https://sw.kovidgoyal.net/kitty/
[starship]: https://starship.rs/
[determinate]: https://github.com/DeterminateSystems/nix-installer
